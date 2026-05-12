import 'package:flutter/material.dart';
import '../../services/auth_service.dart';
import '../../widgets/custom_text_field.dart';
import 'register_screen.dart';
import 'register_screen.dart';
import '../home/home_screen.dart';
import '../../config/app_theme.dart';

class LoginScreen extends StatefulWidget {
  const LoginScreen({super.key});

  @override
  State<LoginScreen> createState() => _LoginScreenState();
}

class _LoginScreenState extends State<LoginScreen> {
  final _formKey = GlobalKey<FormState>();
  final _emailController = TextEditingController();
  final _passwordController = TextEditingController();
  final AuthService _authService = AuthService();
  bool _isLoading = false;

  void _login() async {
    if (!_formKey.currentState!.validate()) return;
    setState(() => _isLoading = true);

    final user = await _authService.login(
      email: _emailController.text.trim(),
      password: _passwordController.text,
    );

    setState(() => _isLoading = false);

    if (user != null && mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const HomeScreen()),
      );
    } else if (mounted) {
      ScaffoldMessenger.of(context).showSnackBar(
        const SnackBar(
          content: Text('Email ou mot de passe incorrect'),
          backgroundColor: Color(0xFFC62828),
        ),
      );
    }
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: AppTheme.backgroundColor,
      body: SafeArea(
        child: SingleChildScrollView(
          padding: const EdgeInsets.all(24),
          child: Form(
            key: _formKey,
            child: Column(
              crossAxisAlignment: CrossAxisAlignment.center,
              children: [
                const SizedBox(height: 40),

                // Logo
                Container(
                  width: 100,
                  height: 100,
                  decoration: BoxDecoration(
                    color: AppTheme.primaryColor,
                    borderRadius: BorderRadius.circular(25),
                  ),
                  child: const Center(
                    child: Text(
                      'S',
                      style: TextStyle(
                        fontSize: 52,
                        fontWeight: FontWeight.bold,
                        color: Colors.white,
                      ),
                    ),
                  ),
                ),

                const SizedBox(height: 16),

                Text(
                  'SERVICY',
                  style: Theme.of(context).textTheme.displayLarge?.copyWith(
                    color: AppTheme.primaryColor,
                    letterSpacing: 3,
                  ),
                ),

                const Text(
                  'Votre service à la demande',
                  style: TextStyle(
                    fontSize: 14,
                    color: AppTheme.secondaryColor,
                  ),
                ),

                const SizedBox(height: 40),

                // Titre
                Align(
                  alignment: Alignment.centerLeft,
                  child: Text(
                    'Connexion',
                    style: Theme.of(context).textTheme.displaySmall,
                  ),
                ),

                const SizedBox(height: 24),

                // Email
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

                // Mot de passe
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

                const SizedBox(height: 8),

                // Mot de passe oublié
                Align(
                  alignment: Alignment.centerRight,
                  child: TextButton(
                    onPressed: () {},
                    child: const Text(
                      'Mot de passe oublié ?',
                      style: TextStyle(color: AppTheme.primaryColor),
                    ),
                  ),
                ),

                const SizedBox(height: 24),

                // Bouton connexion
                SizedBox(
                  width: double.infinity,
                  height: 56,
                  child: ElevatedButton(
                    onPressed: _isLoading ? null : _login,
                    child: _isLoading
                        ? const CircularProgressIndicator(color: Colors.white)
                        : const Text('Se connecter'),
                  ),
                ),

                const SizedBox(height: 24),

                // Lien inscription
                Row(
                  mainAxisAlignment: MainAxisAlignment.center,
                  children: [
                    const Text(
                      'Pas encore de compte ? ',
                      style: TextStyle(color: Color(0xFF2D1B2E)),
                    ),
                    GestureDetector(
                      onTap: () => Navigator.push(
                        context,
                        MaterialPageRoute(builder: (_) => const RegisterScreen()),
                      ),
                      child: const Text(
                        "S'inscrire",
                        style: TextStyle(
                          color: Color(0xFF9B1D54),
                          fontWeight: FontWeight.bold,
                        ),
                      ),
                    ),
                  ],
                ),
              ],
            ),
          ),
        ),
      ),
    );
  }
}