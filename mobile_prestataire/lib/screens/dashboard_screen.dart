import 'package:flutter/material.dart';

class DashboardScreen extends StatefulWidget {
  const DashboardScreen({super.key});
  @override
  State<DashboardScreen> createState() => _DashboardScreenState();
}

class _DashboardScreenState extends State<DashboardScreen> {
  bool _isAvailable = false;

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
              colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]))),
        title: const Text('Mon Dashboard',
            style: TextStyle(color: Colors.white)),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications, color: Colors.white),
            onPressed: () {})
        ],
      ),
      body: Padding(
        padding: const EdgeInsets.all(16),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          // Toggle disponibilité
          Container(
            padding: const EdgeInsets.all(16),
            decoration: BoxDecoration(
              color: Colors.white,
              borderRadius: BorderRadius.circular(16),
              boxShadow: [BoxShadow(
                blurRadius: 12,
                color: const Color(0xFF4F3D8A).withOpacity(0.2))],
            ),
            child: Row(
              mainAxisAlignment: MainAxisAlignment.spaceBetween,
              children: [
                const Text('Disponible maintenant',
                    style: TextStyle(fontSize: 16, fontWeight: FontWeight.bold)),
                Switch(
                  value: _isAvailable,
                  activeColor: const Color(0xFF059669),
                  onChanged: (v) => setState(() => _isAvailable = v),
                ),
              ],
            ),
          ),
          const SizedBox(height: 16),
          // Stats Row
          Row(children: [
            _statCard('RDV aujourd\'hui', '3', Icons.today),
            const SizedBox(width: 8),
            _statCard('Ce mois', '24', Icons.calendar_month),
            const SizedBox(width: 8),
            _statCard('Note globale', '4.8⭐', Icons.star),
          ]),
          const SizedBox(height: 16),
          // Navigation rapide
          const Text('Navigation rapide',
              style: TextStyle(fontSize: 18, fontWeight: FontWeight.bold)),
          const SizedBox(height: 8),
          GridView.count(
            shrinkWrap: true,
            crossAxisCount: 2,
            crossAxisSpacing: 8,
            mainAxisSpacing: 8,
            childAspectRatio: 2.5,
            children: [
              _navButton('Agenda',   Icons.calendar_today),
              _navButton('Services', Icons.build),
              _navButton('Revenus',  Icons.bar_chart),
              _navButton('Profil',   Icons.person),
            ],
          ),
        ]),
      ),
    );
  }

  Widget _statCard(String label, String value, IconData icon) {
    return Expanded(
      child: Container(
        padding: const EdgeInsets.all(12),
        decoration: BoxDecoration(
          color: Colors.white,
          borderRadius: BorderRadius.circular(12),
          border: const Border(
            left: BorderSide(color: Color(0xFFD4A017), width: 4)),
        ),
        child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
          Icon(icon, color: const Color(0xFF4F3D8A), size: 20),
          const SizedBox(height: 4),
          Text(value, style: const TextStyle(
              fontWeight: FontWeight.bold, fontSize: 16)),
          Text(label, style: const TextStyle(fontSize: 11, color: Colors.grey)),
        ]),
      ),
    );
  }

  Widget _navButton(String label, IconData icon) {
    return ElevatedButton.icon(
      style: ElevatedButton.styleFrom(
        backgroundColor: const Color(0xFF4F3D8A),
        shape: RoundedRectangleBorder(
            borderRadius: BorderRadius.circular(12)),
      ),
      icon: Icon(icon, color: Colors.white, size: 18),
      label: Text(label, style: const TextStyle(color: Colors.white)),
      onPressed: () {},
    );
  }
}