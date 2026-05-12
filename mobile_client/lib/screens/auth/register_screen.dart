import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../widgets/custom_text_field.dart';
import '../../config/app_theme.dart';

class RegisterScreen extends StatefulWidget {
  const RegisterScreen({super.key});

  @override
  State<RegisterScreen> createState() => _RegisterScreenState();
}

class _RegisterScreenState extends State<RegisterScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final _phoneController = TextEditingController();
  final AuthService _authService = AuthService();
  bool _isLoading = false;

  void _register() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final success = await _authService.register(
      email: _emailController.text.trim(),
      password: _passwordController.text,
      phone: _phoneController.text.trim(),
    );

    setState(() => _isLoading = false);

    if (success && mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Compte créé avec succès ! Connectez-vous.'),
          backgroundColor: Color(0xFF00897B),
        ),
      );
      Navigator.pop(context);
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Erreur lors de la création du compte'),
          backgroundColor: Color(0xFFC62828),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      appBar: AppBar(
        title: const Text('Créer un compte'),
      ),
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              children: [
                const SizedBox(height: 24),

                const Text(
                  'Bienvenue sur SERVICY',
                  style: TextStyle(
                    fontSize: 22,
                    fontWeight: FontWeight.bold,
                    color: AppTheme.primaryColor,
                  ),
                ),

                const SizedBox(height: 8),

                const Text(
                  'Créez votre compte client',
                  style: TextStyle(color: AppTheme.secondaryColor),
                ),

                const SizedBox(height: 32),

                CustomTextField(
                  label: 'Email',
                  hint: 'exemple@email.com',
                  controller: _emailController,
                  icon: Icons.email_outlined,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Email requis';
                    if (!v.contains('@')) return 'Email invalide';
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                CustomTextField(
                  label: 'Téléphone',
                  hint: '+216 XX XXX XXX',
                  controller: _phoneController,
                  icon: Icons.phone_outlined,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Téléphone requis';
                    return null;
                  },
                ),

                const SizedBox(height: 16),

                CustomTextField(
                  label: 'Mot de passe',
                  hint: '••••••••',
                  controller: _passwordController,
                  isPassword: true,
                  icon: Icons.lock_outline,
                  validator: (v) {
                    if (v == null || v.isEmpty) return 'Mot de passe requis';
                    if (v.length < 6) return 'Minimum 6 caractères';
                    return null;
                  },
                ),

                const SizedBox(height: 32),

                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _register,
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text("S'inscrire"),
                  ),
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}