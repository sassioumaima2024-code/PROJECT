import 'package:flutter/material.dart';
import 'screens/register_screen.dart';
import 'screens/dashboard_screen.dart';
import 'services/api_service.dart';

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  await ApiService.init();
  runApp(const ServicyApp());
}

class ServicyApp extends StatelessWidget {
  const ServicyApp({super.key});
  @override
  Widget build(BuildContext context) {
    return MaterialApp(
      title: 'SERVICY Prestataire',
      debugShowCheckedModeBanner: false,
      theme: ThemeData(
        primaryColor: const Color(0xFF4F3D8A),
        fontFamily: 'Inter',
      ),
      initialRoute: '/register',
      routes: {
        '/register':  (_) => const RegisterScreen(),
        '/dashboard': (_) => const DashboardScreen(),
      },
    );
  }
}