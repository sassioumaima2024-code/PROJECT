import 'package:flutter/material.dart';
import '../../models/appointment_model.dart';
import '../../services/appointment_service.dart';
import 'package:mobile_client/screens/review/review_screen.dart';

class MyAppointmentsScreen extends StatefulWidget {
  const MyAppointmentsScreen({super.key});

  @override
  State<MyAppointmentsScreen> createState() => _MyAppointmentsScreenState();
}

class _MyAppointmentsScreenState extends State<MyAppointmentsScreen> {
  final AppointmentService _appointmentService = AppointmentService();
  List<AppointmentModel> _appointments = [];
  bool _isLoading = true;

  @override
  void initState() {
    super.initState();
    _loadAppointments();
  }

  void _loadAppointments() async {
    final appointments = await _appointmentService.getMyAppointments();
    setState(() {
      _appointments = appointments;
      _isLoading = false;
    });
  }

  Color _statusColor(String? status) {
    switch (status) {
      case 'confirmed': return const Color(0xFF00897B);
      case 'cancelled': return const Color(0xFFC62828);
      case 'in_progress': return const Color(0xFF1565C0);
      case 'completed': return const Color(0xFF2E7D32);
      default: return const Color(0xFFF57F17);
    }
  }

  String _statusLabel(String? status) {
    switch (status) {
      case 'confirmed': return 'Confirmée ✅';
      case 'cancelled': return 'Annulée ❌';
      case 'in_progress': return 'En cours 🔧';
      case 'completed': return 'Terminée ✅';
      default: return 'En attente ⏳';
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF0F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFF9B1D54),
        title: const Text(
          'Mes réservations',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF9B1D54)),
            )
          : _appointments.isEmpty
              ? Center(
                  child: Column(
                    mainAxisAlignment: MainAxisAlignment.center,
                    children: [
                      const Icon(
                        Icons.calendar_today,
                        size: 60,
                        color: Color(0xFFF48FB1),
                      ),
                      const SizedBox(height: 12),
                      const Text(
                        'Aucune réservation',
                        style: TextStyle(
                          color: Color(0xFF9B1D54),
                          fontSize: 16,
                        ),
                      ),
                    ],
                  ),
                )
              : ListView.builder(
                  padding: const EdgeInsets.all(16),
                  itemCount: _appointments.length,
                  itemBuilder: (context, index) {
                    final appt = _appointments[index];
                    return Container(
                      margin: const EdgeInsets.only(bottom: 12),
                      padding: const EdgeInsets.all(16),
                      decoration: BoxDecoration(
                        color: Colors.white,
                        borderRadius: BorderRadius.circular(14),
                        boxShadow: [
                          BoxShadow(
                            color: const Color(0xFF9B1D54).withOpacity(0.1),
                            blurRadius: 6,
                            offset: const Offset(0, 2),
                          ),
                        ],
                      ),
                      child: Column(
                        crossAxisAlignment: CrossAxisAlignment.start,
                        children: [
                          Row(
                            mainAxisAlignment: MainAxisAlignment.spaceBetween,
                            children: [
                              Text(
                                'Réservation #${appt.id}',
                                style: const TextStyle(
                                  fontWeight: FontWeight.bold,
                                  color: Color(0xFF2D1B2E),
                                  fontSize: 16,
                                ),
                              ),
                              Container(
                                padding: const EdgeInsets.symmetric(
                                  horizontal: 10,
                                  vertical: 4,
                                ),
                                decoration: BoxDecoration(
                                  color: _statusColor(appt.status).withOpacity(0.1),
                                  borderRadius: BorderRadius.circular(20),
                                  border: Border.all(
                                    color: _statusColor(appt.status),
                                  ),
                                ),
                                child: Text(
                                  _statusLabel(appt.status),
                                  style: TextStyle(
                                    color: _statusColor(appt.status),
                                    fontSize: 12,
                                    fontWeight: FontWeight.bold,
                                  ),
                                ),
                              ),
                            ],
                          ),
                          const SizedBox(height: 8),
                          Row(
                            children: [
                              const Icon(Icons.description_outlined,
                                  size: 16, color: Color(0xFF9B1D54)),
                              const SizedBox(width: 6),
                              Expanded(
                                child: Text(
                                  appt.description,
                                  style: const TextStyle(color: Colors.grey),
                                ),
                              ),
                            ],
                          ),
                          if (appt.date != null) ...[
                            const SizedBox(height: 6),
                            Row(
                              children: [
                                const Icon(Icons.calendar_today,
                                    size: 16, color: Color(0xFF9B1D54)),
                                const SizedBox(width: 6),
                                Text(
                                  '${appt.date!.day}/${appt.date!.month}/${appt.date!.year}',
                                  style: const TextStyle(color: Colors.grey),
                                ),
                              ],
                            ),
                          ],
                          if (appt.isUrgent) ...[
                            const SizedBox(height: 6),
                            const Row(
                              children: [
                                Icon(Icons.warning_amber,
                                    size: 16, color: Color(0xFFC62828)),
                                SizedBox(width: 6),
                                Text(
                                  'Intervention urgente',
                                  style: TextStyle(
                                    color: Color(0xFFC62828),
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                              ],
                            ),
                          ],

                          // 👇 BOUTON AVIS — ajouté ici
                          if (appt.status == 'completed') ...[
                            const SizedBox(height: 8),
                            SizedBox(
                              width: double.infinity,
                              child: ElevatedButton.icon(
                                onPressed: () => Navigator.push(
                                  context,
                                  MaterialPageRoute(
                                    builder: (_) => ReviewScreen(
                                        appointmentId: appt.id ?? 0),
                                  ),
                                ),
                                icon: const Icon(Icons.star,
                                    color: Colors.white, size: 16),
                                label: const Text(
                                  'Laisser un avis',
                                  style: TextStyle(color: Colors.white),
                                ),
                                style: ElevatedButton.styleFrom(
                                  backgroundColor: const Color(0xFF9B1D54),
                                  shape: RoundedRectangleBorder(
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                ),
                              ),
                            ),
                          ],
                        ],
                      ),
                    );
                  },
                ),
    );
  }
}