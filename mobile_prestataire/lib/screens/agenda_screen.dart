import 'package:flutter/material.dart';
import 'package:mobile_prestataire/services/api_service.dart';
import 'package:table_calendar/table_calendar.dart';

class AgendaScreen extends StatefulWidget {
  const AgendaScreen({super.key});

  @override
  State<AgendaScreen> createState() => _AgendaScreenState();
}

class _AgendaScreenState extends State<AgendaScreen> {
  DateTime _focusedDay = DateTime.now();
  DateTime? _selectedDay;
  List<dynamic> _appointments = [];

  @override
  void initState() {
    super.initState();
    _loadAppointments();
  }

  Future<void> _loadAppointments() async {
    try {
      final res = await ApiService.get('/provider/appointments');
      setState(() => _appointments = res['data'] ?? []);
    } catch (_) {}
  }

  Future<void> _accept(int id) async {
    await ApiService.patch('/appointments/$id/accept');
    _loadAppointments();
  }

  Future<void> _refuse(int id) async {
    await ApiService.patch('/appointments/$id/refuse', {'reason': 'Non disponible'});
    _loadAppointments();
  }

  Future<void> _alternative(int id) async {
    final ctrl = TextEditingController();
    await showDialog(
      context: context,
      builder: (_) => AlertDialog(
        title: const Text('Proposer autre creneau'),
        content: TextField(controller: ctrl, decoration: const InputDecoration(hintText: '2026-05-07 14:30')),
        actions: [
          TextButton(onPressed: () => Navigator.pop(context), child: const Text('Annuler')),
          FilledButton(
            onPressed: () async {
              await ApiService.patch('/appointments/$id/alternative', {'scheduled_at': ctrl.text});
              if (mounted) Navigator.pop(context);
              _loadAppointments();
            },
            child: const Text('Envoyer'),
          ),
        ],
      ),
    );
  }

  Future<void> _start(int id) async {
    await ApiService.patch('/appointments/$id/start');
    _loadAppointments();
  }

  Future<void> _complete(int id) async {
    await ApiService.patch('/appointments/$id/complete');
    _loadAppointments();
  }

  Color _statusColor(String status) {
    switch (status) {
      case 'confirmed':
        return const Color(0xFF059669);
      case 'pending':
        return const Color(0xFFD4A017);
      case 'cancelled':
        return const Color(0xFFDC2626);
      case 'in_progress':
        return const Color(0xFF4F3D8A);
      default:
        return Colors.grey;
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
        title: const Text('Mon Agenda', style: TextStyle(color: Colors.white)),
      ),
      body: Column(children: [
        TableCalendar(
          firstDay: DateTime.utc(2024, 1, 1),
          lastDay: DateTime.utc(2027, 12, 31),
          focusedDay: _focusedDay,
          selectedDayPredicate: (day) => isSameDay(_selectedDay, day),
          onDaySelected: (selected, focused) {
            setState(() {
              _selectedDay = selected;
              _focusedDay = focused;
            });
          },
          calendarStyle: const CalendarStyle(
            selectedDecoration: BoxDecoration(color: Color(0xFF4F3D8A), shape: BoxShape.circle),
            todayDecoration: BoxDecoration(color: Color(0xFF7C5CBF), shape: BoxShape.circle),
          ),
        ),
        const Divider(),
        Expanded(
          child: _appointments.isEmpty
              ? const Center(child: Text('Aucun rendez-vous'))
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _appointments.length,
                  itemBuilder: (_, i) => _appointmentCard(_appointments[i]),
                ),
        ),
      ]),
    );
  }

  Widget _appointmentCard(Map<String, dynamic> a) {
    final status = a['status'] ?? '';
    final client = a['client'] as Map<String, dynamic>?;
    return Container(
      margin: const EdgeInsets.only(bottom: 12),
      padding: const EdgeInsets.all(16),
      decoration: BoxDecoration(
        color: Colors.white,
        borderRadius: BorderRadius.circular(16),
        border: Border(left: BorderSide(color: _statusColor(status), width: 4)),
      ),
      child: Column(crossAxisAlignment: CrossAxisAlignment.start, children: [
        Text(a['description'] ?? 'RDV', style: const TextStyle(fontWeight: FontWeight.bold)),
        Text('Statut : $status', style: TextStyle(color: _statusColor(status))),
        if (a['scheduledAt'] != null) Text('Date : ${a['scheduledAt']}'),
        if (client != null) Text('Client : ${client['name'] ?? ''}'),
        if (a['budget'] != null) Text('Budget : ${a['budget']} DT'),
        const SizedBox(height: 8),
        Wrap(spacing: 8, children: [
          if (status == 'pending')
            TextButton.icon(
              icon: const Icon(Icons.check, color: Color(0xFF059669)),
              label: const Text('Accepter', style: TextStyle(color: Color(0xFF059669))),
              onPressed: () => _accept(a['id']),
            ),
          if (status == 'pending')
            TextButton.icon(
              icon: const Icon(Icons.close, color: Color(0xFFDC2626)),
              label: const Text('Refuser', style: TextStyle(color: Color(0xFFDC2626))),
              onPressed: () => _refuse(a['id']),
            ),
          if (status == 'pending')
            TextButton.icon(
              icon: const Icon(Icons.schedule, color: Color(0xFF4F3D8A)),
              label: const Text('Autre'),
              onPressed: () => _alternative(a['id']),
            ),
          if (status == 'confirmed')
            TextButton.icon(
              icon: const Icon(Icons.play_arrow, color: Color(0xFF4F3D8A)),
              label: const Text('Demarrer'),
              onPressed: () => _start(a['id']),
            ),
          if (status == 'in_progress')
            TextButton.icon(
              icon: const Icon(Icons.check_circle, color: Color(0xFF059669)),
              label: const Text('Terminer'),
              onPressed: () => _complete(a['id']),
            ),
        ]),
      ]),
    );
  }
}
