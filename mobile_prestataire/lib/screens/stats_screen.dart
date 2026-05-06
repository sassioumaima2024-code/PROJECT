import 'package:fl_chart/fl_chart.dart';
import 'package:flutter/material.dart';
import 'package:mobile_prestataire/services/api_service.dart';

class StatsScreen extends StatefulWidget {
  const StatsScreen({super.key});

  @override
  State<StatsScreen> createState() => _StatsScreenState();
}

class _StatsScreenState extends State<StatsScreen> {
  Map<String, dynamic> _stats = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadStats();
  }

  Future<void> _loadStats() async {
    try {
      final res = await ApiService.get('/provider/dashboard');
      setState(() {
        _stats = res;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]),
          ),
        ),
        title: const Text('Revenus & Stats', style: TextStyle(color: Colors.white)),
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : SingleChildScrollView(
              padding: const EdgeInsets.all(16),
              child: Column(children: [
                Row(children: [
                  _kpiCard('Acceptation', '${_stats['acceptanceRate'] ?? 0}%', Icons.thumb_up),
                  const SizedBox(width: 8),
                  _kpiCard('Completes', '${_stats['completedAppointments'] ?? 0}', Icons.check_circle),
                  const SizedBox(width: 8),
                  _kpiCard('Mauvaises', '${_stats['badRatingsCount'] ?? 0}', Icons.warning),
                ]),
                const SizedBox(height: 24),
                _chartCard(),
                const SizedBox(height: 16),
                if ((_stats['badRatingsCount'] ?? 0) >= 10)
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(16),
                    decoration: BoxDecoration(
                      color: const Color(0xFFDC2626).withValues(alpha: 0.08),
                      borderRadius: BorderRadius.circular(12),
                      border: Border.all(color: const Color(0xFFDC2626)),
                    ),
                    child: const Text('Alerte: compteur de mauvaises notes eleve.', style: TextStyle(color: Color(0xFFDC2626))),
                  ),
              ]),
            ),
    );
  }

  Widget _chartCard() {
    final month = ((_stats['monthAppointments'] ?? 0) as num).toDouble();
    final completed = ((_stats['completedAppointments'] ?? 0) as num).toDouble();
    final today = ((_stats['todayAppointments'] ?? 0) as num).toDouble();
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(blurRadius: 8, color: Colors.black.withValues(alpha: 0.08))],
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        const Text('Activite', style: TextStyle(fontWeight: FontWeight.bold, fontSize: 16, color: Color(0xFF4F3D8A))),
        const SizedBox(height: 16),
        SizedBox(
          height: 200,
          child: BarChart(BarChartData(
            barGroups: [_bar(0, today), _bar(1, month), _bar(2, completed)],
            titlesData: FlTitlesData(
              bottomTitles: AxisTitles(
                sideTitles: SideTitles(
                  showTitles: true,
                  getTitlesWidget: (v, _) => Text(['Jour', 'Mois', 'Finis'][v.toInt()], style: const TextStyle(fontSize: 12)),
                ),
              ),
              leftTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
              topTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
              rightTitles: AxisTitles(sideTitles: SideTitles(showTitles: false)),
            ),
            gridData: FlGridData(show: false),
            borderData: FlBorderData(show: false),
          )),
        ),
      ]),
    );
  }

  BarChartGroupData _bar(int x, double y) {
    return BarChartGroupData(x: x, barRods: [
      BarChartRodData(
        toY: y <= 0 ? 1 : y,
        color: const Color(0xFF4F3D8A),
        width: 28,
        borderRadius: BorderRadius.circular(4),
      ),
    ]);
  }

  Widget _kpiCard(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: const Border(left: BorderSide(color: Color(0xFFD4A017), width: 4)),
        ),
        child: Column(children: [
          Icon(icon, color: const Color(0xFF4F3D8A)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ]),
      ),
    );
  }
}
