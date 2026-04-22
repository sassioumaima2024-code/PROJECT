import 'package:flutter/material.dart';
import 'package:fl_chart/fl_chart.dart';

class StatsScreen extends StatelessWidget {
  const StatsScreen({super.key});

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
                colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]))),
        title: const Text('Revenus & Stats',
            style: TextStyle(color: Colors.white)),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(children: [
          // KPI Row
          Row(children: [
            _kpiCard('Acceptation', '87%', Icons.thumb_up),
            const SizedBox(width: 8),
            _kpiCard('Complétés', '42', Icons.check_circle),
            const SizedBox(width: 8),
            _kpiCard('Note moy.', '4.8⭐', Icons.star),
          ]),
          const SizedBox(height: 24),
          // Graphique revenus
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(
                  blurRadius: 8, color: Colors.black.withOpacity(0.08))],
            ),
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.start,
              children: [
                const Text('Revenus par semaine',
                    style: TextStyle(fontWeight: FontWeight.bold,
                        fontSize: 16, color: Color(0xFF4F3D8A))),
                const SizedBox(height: 16),
                SizedBox(
                  height: 200,
                  child: BarChart(BarChartData(
                    barGroups: [
                      _bar(0, 320),
                      _bar(1, 450),
                      _bar(2, 280),
                      _bar(3, 590),
                      _bar(4, 410),
                      _bar(5, 670),
                      _bar(6, 520),
                    ],
                    titlesData: FlTitlesData(
                      bottomTitles: AxisTitles(
                        sideTitles: SideTitles(
                          showTitles: true,
                          getTitlesWidget: (v, _) => Text(
                            ['L','M','M','J','V','S','D'][v.toInt()],
                            style: const TextStyle(fontSize: 12),
                          ),
                        ),
                      ),
                      leftTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false)),
                      topTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false)),
                      rightTitles: AxisTitles(
                          sideTitles: SideTitles(showTitles: false)),
                    ),
                    gridData: FlGridData(show: false),
                    borderData: FlBorderData(show: false),
                  )),
                ),
              ],
            ),
          ),
        ]),
      ),
    );
  }

  BarChartGroupData _bar(int x, double y) {
    return BarChartGroupData(x: x, barRods: [
      BarChartRodData(
        toY: y,
        color: const Color(0xFF4F3D8A),
        width: 18,
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
          border: const Border(
              left: BorderSide(color: Color(0xFFD4A017), width: 4)),
        ),
        child: Column(children: [
          Icon(icon, color: const Color(0xFF4F3D8A)),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(
              fontWeight: FontWeight.bold, fontSize: 16)),
          Text(label, style: const TextStyle(
              fontSize: 11, color: Colors.grey)),
        ]),
      ),
    );
  }
}