import 'package:flutter/material.dart';
import 'package:mobile_prestataire/services/api_service.dart';
import 'package:flutter_secure_storage/flutter_secure_storage.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});
  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nomCtrl   = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl  = TextEditingController();
  final _storage   = FlutterSecureStorage();
  bool _loading = false;

  Future<void> _register() async {
    setState(() => _loading = true);
    try {
      final res = await ApiService.post('/register', {
        'role': 'prestataire',
        'nom_commercial': _nomCtrl.text,
        'email': _emailCtrl.text,
        'phone': _phoneCtrl.text,
        'password': _passCtrl.text,
      });
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Compte créé ! ID: ${res['id']}')));
    } catch (e) {
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Erreur: $e')));
    }
    setState(() => _loading = false);
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        backgroundColor: const Color(0xFF4F3D8A),
        title: const Text('Inscription Prestataire',
            style: TextStyle(color: Colors.white)),
      ),
      body: Padding(
        padding: const EdgeInsets.all(24),
        child: Column(children: [
          _field(_nomCtrl,   'Nom commercial',  Icons.business),
          const SizedBox(height: 16),
          _field(_emailCtrl, 'Email',            Icons.email),
          const SizedBox(height: 16),
          _field(_phoneCtrl, 'Téléphone (+216)', Icons.phone),
          const SizedBox(height: 16),
          _field(_passCtrl,  'Mot de passe',     Icons.lock, obscure: true),
          const SizedBox(height: 32),
          SizedBox(
            width: double.infinity,
            height: 52,
            child: DecoratedBox(
              decoration: BoxDecoration(
                gradient: const LinearGradient(
                  colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]),
                borderRadius: BorderRadius.circular(16),
              ),
              child: ElevatedButton(
                style: ElevatedButton.styleFrom(
                  backgroundColor: Colors.transparent,
                  shadowColor: Colors.transparent,
                  shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16))),
                onPressed: _loading ? null : _register,
                child: _loading
                    ? const CircularProgressIndicator(color: Colors.white)
                    : const Text('Créer mon compte',
                        style: TextStyle(color: Colors.white, fontSize: 16)),
              ),
            ),
          ),
        ]),
      ),
    );
  }

  Widget _field(TextEditingController ctrl, String label, IconData icon,
      {bool obscure = false}) {
    return TextField(
      controller: ctrl,
      obscureText: obscure,
      decoration: InputDecoration(
        labelText: label,
        prefixIcon: Icon(icon, color: const Color(0xFF4F3D8A)),
        border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
        focusedBorder: OutlineInputBorder(
          borderRadius: BorderRadius.circular(12),
          borderSide: const BorderSide(color: Color(0xFF4F3D8A), width: 2)),
      ),
    );
  }
}