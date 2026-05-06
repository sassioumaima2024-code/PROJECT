import 'package:flutter/material.dart';
import '../../models/appointment_model.dart';
import '../../services/appointment_service.dart';
import '../../widgets/custom_text_field.dart';

class AppointmentScreen extends StatefulWidget {
  const AppointmentScreen({super.key});

  @override
  State<AppointmentScreen> createState() => _AppointmentScreenState();
}

class _AppointmentScreenState extends State<AppointmentScreen> {
  final _formKey = GlobalKey<FormState>();
  final _addressController = TextEditingController();
  final _descriptionController = TextEditingController();
  final AppointmentService _appointmentService = AppointmentService();
  bool _isUrgent = false;
  bool _isLoading = false;
  DateTime? _selectedDate;

  void _pickDate() async {
    final date = await showDatePicker(
      context: context,
      initialDate: DateTime.now().add(const Duration(days: 1)),
      firstDate: DateTime.now(),
      lastDate: DateTime.now().add(const Duration(days: 60)),
      builder: (context, child) {
        return Theme(
          data: Theme.of(context).copyWith(
            colorScheme: const ColorScheme.light(
              primary: Color(0xFF9B1D54),
            ),
          ),
          child: child!,
        );
      },
    );
    if (date != null) setState(() => _selectedDate = date);
  }

  void _submit() async {
    if (!_formKey.currentState!.validate()) return;
    if (_selectedDate == null && !_isUrgent) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Veuillez choisir une date ou cocher Urgent'),
          backgroundColor: Color(0xFFC62828),
        ),
      );
      return;
    }

    setState(() => _isLoading = true);

    final appointment = AppointmentModel(
      address: _addressController.text.trim(),
      description: _descriptionController.text.trim(),
      isUrgent: _isUrgent,
      date: _selectedDate,
    );

    final success = await _appointmentService.createAppointment(appointment);
    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Réservation envoyée avec succès ! ✅'),
          backgroundColor: Color(0xFF00897B),
        ),
      );
      Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de la réservation'),
          backgroundColor: Color(0xFFC62828),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFDF0F5),
      appBar: AppBar(
        backgroundColor: const Color(0xFF9B1D54),
        title: const Text(
          'Nouvelle réservation',
          style: TextStyle(color: Colors.white),
        ),
        iconTheme: const IconThemeData(color: Colors.white),
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(24),
        child: Form(
          key: _formKey,
          child: Column(
            crossAxisAlignment: CrossAxisAlignment.start,
            children: [

              const SizedBox(height: 8),

              // Adresse
              CustomTextField(
                label: 'Adresse',
                hint: 'Ex: 12 Rue de la Paix, Tunis',
                controller: _addressController,
                icon: Icons.location_on_outlined,
                validator: (v) =>
                    v == null || v.isEmpty ? 'Adresse requise' : null,
              ),

              const SizedBox(height: 16),

              // Description
              TextFormField(
                controller: _descriptionController,
                maxLines: 4,
                validator: (v) =>
                    v == null || v.isEmpty ? 'Description requise' : null,
                decoration: InputDecoration(
                  labelText: 'Description du problème',
                  hintText: 'Décrivez votre besoin...',
                  labelStyle: const TextStyle(color: Color(0xFF9B1D54)),
                  enabledBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(color: Color(0xFFF48FB1)),
                  ),
                  focusedBorder: OutlineInputBorder(
                    borderRadius: BorderRadius.circular(12),
                    borderSide: const BorderSide(
                        color: Color(0xFF9B1D54), width: 2),
                  ),
                  filled: true,
                  fillColor: const Color(0xFFFDF0F5),
                ),
              ),

              const SizedBox(height: 16),

              // Date
              GestureDetector(
                onTap: _pickDate,
                child: Container(
                  padding: const EdgeInsets.all(16),
                  decoration: BoxDecoration(
                    color: const Color(0xFFFDF0F5),
                    borderRadius: BorderRadius.circular(12),
                    border: Border.all(color: const Color(0xFFF48FB1)),
                  ),
                  child: Row(
                    children: [
                      const Icon(Icons.calendar_today,
                          color: Color(0xFF9B1D54)),
                      const SizedBox(width: 12),
                      Text(
                        _selectedDate == null
                            ? 'Choisir une date'
                            : '${_selectedDate!.day}/${_selectedDate!.month}/${_selectedDate!.year}',
                        style: TextStyle(
                          color: _selectedDate == null
                              ? Colors.grey
                              : const Color(0xFF2D1B2E),
                        ),
                      ),
                    ],
                  ),
                ),
              ),

              const SizedBox(height: 16),

              // Urgent
              Container(
                padding: const EdgeInsets.symmetric(
                    horizontal: 16, vertical: 8),
                decoration: BoxDecoration(
                  color: _isUrgent
                      ? const Color(0xFFFFEBEE)
                      : Colors.white,
                  borderRadius: BorderRadius.circular(12),
                  border: Border.all(
                    color: _isUrgent
                        ? const Color(0xFFC62828)
                        : const Color(0xFFF48FB1),
                  ),
                ),
                child: Row(
                  children: [
                    const Icon(Icons.warning_amber,
                        color: Color(0xFFC62828)),
                    const SizedBox(width: 12),
                    const Expanded(
                      child: Text(
                        'Intervention urgente',
                        style: TextStyle(
                          color: Color(0xFF2D1B2E),
                          fontWeight: FontWeight.w500,
                        ),
                      ),
                    ),
                    Switch(
                      value: _isUrgent,
                      onChanged: (v) => setState(() => _isUrgent = v),
                      activeColor: const Color(0xFF9B1D54),
                    ),
                  ],
                ),
              ),

              const SizedBox(height: 32),

              // Bouton
              SizedBox(
                width: double.infinity,
                height: 52,
                child: ElevatedButton(
                  onPressed: _isLoading ? null : _submit,
                  style: ElevatedButton.styleFrom(
                    backgroundColor: const Color(0xFF9B1D54),
                    shape: RoundedRectangleBorder(
                      borderRadius: BorderRadius.circular(14),
                    ),
                  ),
                  child: _isLoading
                      ? const CircularProgressIndicator(
                          color: Colors.white)
                      : const Text(
                          'Confirmer la réservation',
                          style: TextStyle(
                            fontSize: 16,
                            fontWeight: FontWeight.bold,
                            color: Colors.white,
                          ),
                        ),
                ),
              ),
            ],
          ),
        ),
      ),
    );
  }
}