import 'dart:convert';

import 'package:dio/dio.dart';
import 'package:flutter/material.dart';
import 'package:image_picker/image_picker.dart';
import 'package:mobile_prestataire/services/api_service.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _nomCtrl = TextEditingController();
  final _emailCtrl = TextEditingController();
  final _phoneCtrl = TextEditingController();
  final _passCtrl = TextEditingController();
  final _otpCtrl = TextEditingController();
  final _formKey = GlobalKey<FormState>();
  final _picker = ImagePicker();

  final _governorates = ['Tunis', 'Ariana', 'Ben Arous', 'Manouba', 'Sousse', 'Sfax', 'Nabeul'];
  final _categories = ['Plomberie', 'Electricite', 'Menage', 'Coiffure', 'Peinture', 'Taxi'];
  final Set<String> _selectedCategories = {};
  final List<XFile> _portfolio = [];
  String _selectedGovernorate = 'Tunis';
  XFile? _profilePhoto;
  XFile? _cinDocument;
  XFile? _certificateDocument;
  int _step = 0;
  bool _loading = false;

  Future<void> _pickProfilePhoto() async {
    final file = await _picker.pickImage(source: ImageSource.gallery);
    if (file != null) {
      setState(() => _profilePhoto = file);
    }
  }

  Future<void> _pickPortfolioPhoto() async {
    if (_portfolio.length >= 10) return;
    final file = await _picker.pickImage(source: ImageSource.gallery);
    if (file != null) {
      setState(() => _portfolio.add(file));
    }
  }

  Future<void> _pickDocument(bool cin) async {
    final file = await _picker.pickMedia();
    if (file != null) {
      setState(() {
        if (cin) {
          _cinDocument = file;
        } else {
          _certificateDocument = file;
        }
      });
    }
  }

  Future<MultipartFile> _multipart(XFile file) {
    return MultipartFile.fromFile(file.path, filename: file.name);
  }

  Future<void> _register() async {
    if (!_formKey.currentState!.validate() || _selectedCategories.isEmpty) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(content: Text('Completez les champs obligatoires')),
      );
      return;
    }

    setState(() => _loading = true);
    try {
      final form = FormData.fromMap({
        'role': 'prestataire',
        'nom_commercial': _nomCtrl.text.trim(),
        'email': _emailCtrl.text.trim(),
        'phone': _phoneCtrl.text.trim(),
        'password': _passCtrl.text,
        'gouvernorats': jsonEncode([_selectedGovernorate]),
        'categories': jsonEncode(_selectedCategories.toList()),
      });
      final profilePhoto = _profilePhoto;
      final cinDocument = _cinDocument;
      final certificateDocument = _certificateDocument;
      if (profilePhoto != null) {
        form.files.add(MapEntry('profile_photo', await _multipart(profilePhoto)));
      }
      if (cinDocument != null) {
        form.files.add(MapEntry('cin_document', await _multipart(cinDocument)));
      }
      if (certificateDocument != null) {
        form.files.add(MapEntry('certificate_document', await _multipart(certificateDocument)));
      }
      for (final file in _portfolio) {
        form.files.add(MapEntry('portfolio[]', await _multipart(file)));
      }

      final res = await ApiService.postForm('/register', form);
      final login = await ApiService.post('/login', {
        'email': _emailCtrl.text.trim(),
        'password': _passCtrl.text,
      });
      if (login['token'] != null) {
        await ApiService.saveToken(login['token']);
      }
      if (!mounted) return;
      setState(() => _step = 2);
      ScaffoldMessenger.of(context).showSnackBar(
        SnackBar(content: Text('Compte cree. OTP dev: ${res['dev_otp'] ?? 'envoye'}')),
      );
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('Erreur: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  Future<void> _verifyOtp() async {
    setState(() => _loading = true);
    try {
      await ApiService.post('/verify-otp', {
        'email': _emailCtrl.text.trim(),
        'code': _otpCtrl.text.trim(),
      });
      if (!mounted) return;
      Navigator.pushReplacementNamed(context, '/dashboard');
    } catch (e) {
      if (!mounted) return;
      ScaffoldMessenger.of(context).showSnackBar(SnackBar(content: Text('OTP invalide: $e')));
    } finally {
      if (mounted) setState(() => _loading = false);
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        backgroundColor: const Color(0xFF4F3D8A),
        title: const Text('Inscription Prestataire', style: TextStyle(color: Colors.white)),
      ),
      body: Stepper(
        currentStep: _step,
        onStepTapped: (step) => setState(() => _step = step),
        controlsBuilder: (context, details) => const SizedBox.shrink(),
        steps: [
          Step(title: const Text('Infos'), isActive: _step >= 0, content: _infosStep()),
          Step(title: const Text('Docs'), isActive: _step >= 1, content: _docsStep()),
          Step(title: const Text('Verif'), isActive: _step >= 2, content: _otpStep()),
        ],
      ),
    );
  }

  Widget _infosStep() {
    return Form(
      key: _formKey,
      child: Column(children: [
        _field(_nomCtrl, 'Nom commercial', Icons.business),
        const SizedBox(height: 12),
        _field(_emailCtrl, 'Email', Icons.email, email: true),
        const SizedBox(height: 12),
        _field(_phoneCtrl, 'Telephone (+216)', Icons.phone, phone: true),
        const SizedBox(height: 12),
        _field(_passCtrl, 'Mot de passe', Icons.lock, obscure: true),
        const SizedBox(height: 12),
        DropdownButtonFormField<String>(
          initialValue: _selectedGovernorate,
          decoration: _inputDecoration('Gouvernorat', Icons.place),
          items: _governorates.map((g) => DropdownMenuItem(value: g, child: Text(g))).toList(),
          onChanged: (value) => setState(() => _selectedGovernorate = value ?? _selectedGovernorate),
        ),
        const SizedBox(height: 12),
        Align(
          alignment: Alignment.centerLeft,
          child: Wrap(
            spacing: 8,
            children: _categories.map((category) {
              final selected = _selectedCategories.contains(category);
              return FilterChip(
                label: Text(category),
                selected: selected,
                selectedColor: const Color(0xFFA78BFA),
                onSelected: (value) {
                  setState(() {
                    value ? _selectedCategories.add(category) : _selectedCategories.remove(category);
                  });
                },
              );
            }).toList(),
          ),
        ),
        const SizedBox(height: 20),
        _primaryButton('Continuer', () => setState(() => _step = 1)),
      ]),
    );
  }

  Widget _docsStep() {
    return Column(children: [
      _uploadTile('Photo profil', _profilePhoto?.name, _pickProfilePhoto),
      _uploadTile('CIN', _cinDocument?.name, () => _pickDocument(true)),
      _uploadTile('Certificat', _certificateDocument?.name, () => _pickDocument(false)),
      _uploadTile('Portfolio (${_portfolio.length}/10)', _portfolio.isEmpty ? null : _portfolio.map((file) => file.name).join(', '), _pickPortfolioPhoto),
      const SizedBox(height: 20),
      _primaryButton(_loading ? 'Creation...' : 'Creer mon compte', _loading ? null : _register),
    ]);
  }

  Widget _otpStep() {
    return Column(children: [
      _field(_otpCtrl, 'Code OTP 6 chiffres', Icons.sms),
      const SizedBox(height: 20),
      _primaryButton(_loading ? 'Verification...' : 'Verifier', _loading ? null : _verifyOtp),
    ]);
  }

  Widget _field(TextEditingController ctrl, String label, IconData icon,
      {bool obscure = false, bool email = false, bool phone = false}) {
    return TextFormField(
      controller: ctrl,
      obscureText: obscure,
      keyboardType: email ? TextInputType.emailAddress : phone ? TextInputType.phone : TextInputType.text,
      validator: (value) {
        final text = value?.trim() ?? '';
        if (text.isEmpty) return 'Champ requis';
        if (email && !text.contains('@')) return 'Email invalide';
        if (phone && !RegExp(r'^\+?\d{8,13}$').hasMatch(text)) return 'Telephone invalide';
        if (obscure && text.length < 6) return 'Minimum 6 caracteres';
        return null;
      },
      decoration: _inputDecoration(label, icon),
    );
  }

  InputDecoration _inputDecoration(String label, IconData icon) {
    return InputDecoration(
      labelText: label,
      prefixIcon: Icon(icon, color: const Color(0xFF4F3D8A)),
      border: OutlineInputBorder(borderRadius: BorderRadius.circular(12)),
      focusedBorder: OutlineInputBorder(
        borderRadius: BorderRadius.circular(12),
        borderSide: const BorderSide(color: Color(0xFF4F3D8A), width: 2),
      ),
    );
  }

  Widget _uploadTile(String title, String? value, VoidCallback onTap) {
    return Card(
      child: ListTile(
        leading: const Icon(Icons.upload_file, color: Color(0xFF4F3D8A)),
        title: Text(title),
        subtitle: Text(value ?? 'Aucun fichier choisi', maxLines: 1, overflow: TextOverflow.ellipsis),
        trailing: const Icon(Icons.chevron_right),
        onTap: onTap,
      ),
    );
  }

  Widget _primaryButton(String label, VoidCallback? onPressed) {
    return SizedBox(
      width: double.infinity,
      height: 52,
      child: ElevatedButton(
        style: ElevatedButton.styleFrom(
          backgroundColor: const Color(0xFF4F3D8A),
          shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
        ),
        onPressed: onPressed,
        child: Text(label, style: const TextStyle(color: Colors.white, fontSize: 16)),
      ),
    );
  }

  @override
  void dispose() {
    _nomCtrl.dispose();
    _emailCtrl.dispose();
    _phoneCtrl.dispose();
    _passCtrl.dispose();
    _otpCtrl.dispose();
    super.dispose();
  }
}
