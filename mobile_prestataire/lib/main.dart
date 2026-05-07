import 'package:flutter/material.dart';
import 'package:firebase_core/firebase_core.dart';
import 'package:firebase_messaging/firebase_messaging.dart';
import 'screens/register_screen.dart';
import 'screens/dashboard_screen.dart';
import 'screens/services_screen.dart';
import 'screens/agenda_screen.dart';
import 'screens/gps_screen.dart';
import 'screens/profile_screen.dart';
import 'screens/stats_screen.dart';
import 'services/api_service.dart';
import 'services/notification_service.dart';

Future<void> _firebaseMessagingBackgroundHandler(RemoteMessage message) async {

  await NotificationService.handleBackgroundMessage(message);
}

void main() async {
  WidgetsFlutterBinding.ensureInitialized();
  
  await Firebase.initializeApp();

  await ApiService.init();

  await NotificationService.init();

  FirebaseMessaging.onBackgroundMessage(_firebaseMessagingBackgroundHandler);

  String? fcmToken = await FirebaseMessaging.instance.getToken();

  if (fcmToken != null) {
    await ApiService.saveFcmToken(fcmToken);
  }
  
  FirebaseMessaging.onMessage.listen((RemoteMessage message) {

    NotificationService.handleForegroundMessage(message);
  });
  
  FirebaseMessaging.onMessageOpenedApp.listen((RemoteMessage message) {

    NotificationService.handleNotificationTap(message.data);
  });
  
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
        useMaterial3: true,
      ),
      initialRoute: '/register',
      routes: {
        '/register':  (_) => const RegisterScreen(),
        '/dashboard': (_) => const DashboardScreen(),
        '/services':  (_) => const ServicesScreen(),
        '/agenda':    (_) => const AgendaScreen(),
        '/gps':       (_) => const GpsScreen(),
        '/profile':   (_) => const ProfileScreen(),
        '/stats':     (_) => const StatsScreen(),
      },
    );
  }
}