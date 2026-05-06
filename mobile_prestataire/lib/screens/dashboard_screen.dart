import 'package:flutter/material.dart';
import 'package:mobile_prestataire/services/api_service.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});

  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  Map<String, dynamic> _dashboard = {};
  bool _loading = true;

  @override
  void initState() {
    super.initState();
    _loadDashboard();
  }

  Future<void> _loadDashboard() async {
    try {
      final res = await ApiService.get('/provider/dashboard');
      setState(() {
        _dashboard = res;
        _loading = false;
      });
    } catch (_) {
      setState(() => _loading = false);
    }
  }

  Future<void> _toggleAvailability() async {
    final res = await ApiService.patch('/provider/availability');
    setState(() => _dashboard['isAvailableNow'] = res['isAvailableNow']);
  }

  @override
  Widget build(BuildContext context) {
    final pending = (_dashboard['pendingRequests'] as List?) ?? [];
    final upcoming = _dashboard['upcomingAppointment'] as Map<String, dynamic>?;

    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]),
          ),
        ),
        title: const Text('Mon Dashboard', style: TextStyle(color: Colors.white)),
        actions: [
          Stack(children: [
            IconButton(
              icon: const Icon(Icons.notifications, color: Colors.white),
              onPressed: () {},
            ),
            if ((_dashboard['unreadNotifications'] ?? 0) > 0)
              Positioned(
                right: 8,
                top: 8,
                child: CircleAvatar(
                  radius: 8,
                  backgroundColor: const Color(0xFFDC2626),
                  child: Text('${_dashboard['unreadNotifications']}', style: const TextStyle(fontSize: 9, color: Colors.white)),
                ),
              ),
          ]),
        ],
      ),
      body: _loading
          ? const Center(child: CircularProgressIndicator())
          : RefreshIndicator(
              onRefresh: _loadDashboard,
              child: ListView(
                padding: const EdgeInsets.all(16),
                children: [
                  _availabilityCard(),
                  const SizedBox(height: 16),
                  Row(children: [
                    _statCard('RDV aujourd hui', '${_dashboard['todayAppointments'] ?? 0}', Icons.today),
                    const SizedBox(width: 8),
                    _statCard('Ce mois', '${_dashboard['monthAppointments'] ?? 0}', Icons.calendar_month),
                    const SizedBox(width: 8),
                    _statCard('Note globale', '${_dashboard['averageRating'] ?? '-'}', Icons.star),
                  ]),
                  const SizedBox(height: 16),
                  if (upcoming != null) _sectionCard('Prochain RDV', '${upcoming['scheduledAt']} - ${upcoming['description'] ?? 'RDV'}'),
                  const SizedBox(height: 16),
                  const Text('Demandes en attente', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  if (pending.isEmpty)
                    _sectionCard('Aucune demande', 'Les nouvelles demandes apparaitront ici.')
                  else
                    ...pending.map((item) => _sectionCard('${item['scheduledAt']}', item['description'] ?? 'Demande RDV')),
                  const SizedBox(height: 16),
                  const Text('Navigation rapide', style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
                  const SizedBox(height: 8),
                  GridView.count(
                    shrinkWrap: true,
                    physics: const NeverScrollableScrollPhysics(),
                    crossAxisCount: 2,
                    crossAxisSpacing: 8,
                    mainAxisSpacing: 8,
                    childAspectRatio: 2.5,
                    children: [
                      _navButton('Agenda', Icons.calendar_today, '/agenda'),
                      _navButton('Services', Icons.build, '/services'),
                      _navButton('Revenus', Icons.bar_chart, '/stats'),
                      _navButton('Profil', Icons.person, '/profile'),
                    ],
                  ),
                ],
              ),
            ),
    );
  }

  Widget _availabilityCard() {
    final isAvailable = _dashboard['isAvailableNow'] == true;
    return Container(
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        boxShadow: [BoxShadow(blurRadius: 12, color: const Color(0xFF4F3D8A).withValues(alpha: 0.2))],
      ),
      child: Row(mainAxisAlignment: MainAxisAlignment.spaceBetween, children: [
        const Text('Disponible maintenant', style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
        Switch(value: isAvailable, activeThumbColor: const Color(0xFF059669), onChanged: (_) => _toggleAvailability()),
      ]),
    );
  }

  Widget _statCard(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: const Border(left: BorderSide(color: Color(0xFFD4A017), width: 4)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: const Color(0xFF4F3D8A), size: 20),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(fontWeight: FontWeight.bold, fontSize: 16)),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ]),
      ),
    );
  }

  Widget _sectionCard(String title, String subtitle) {
    return Container(
      width: double.infinity,
      margin: const EdgeInsets.only(bottom: 8),
      padding: const EdgeInsets.all(14),
      decoration: BoxDecoration(color: Colors.white, borderRadius: BorderRadius.circular(12)),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(title, style: const TextStyle(fontWeight: FontWeight.bold, color: Color(0xFF4F3D8A))),
        const SizedBox(height: 4),
        Text(subtitle),
      ]),
    );
  }

  Widget _navButton(String label, IconData icon, String route) {
    return ElevatedButton.icon(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF4F3D8A),
        shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(12)),
      ),
      icon: Icon(icon, color: Colors.white, size: 18),
      label: Text(label, style: const TextStyle(color: Colors.white)),
      onPressed: () => Navigator.pushNamed(context, route),
    );
  }
}
