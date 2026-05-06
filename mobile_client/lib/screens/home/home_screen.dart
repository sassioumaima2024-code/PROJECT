import 'package:flutter/material.dart';
import '../../models/service_model.dart';
import '../../services/auth_service.dart';
import '../../services/service_service.dart';
import '../auth/login_screen.dart';
import '../appointment/appointment_screen.dart';
import '../appointment/my_appointments_screen.dart';
import '../profile/profile_screen.dart';
import '../notification/notification_screen.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ServiceService _serviceService = ServiceService();
  final AuthService _authService = AuthService();
  List<ServiceModel> _services = [];
  bool _isLoading = true;
  String _searchQuery = '';

  final List<Map<String, dynamic>> _categories = [
    {'icon': '🔧', 'label': 'Plomberie'},
    {'icon': '⚡', 'label': 'Électricité'},
    {'icon': '🧹', 'label': 'Ménage'},
    {'icon': '🎨', 'label': 'Peinture'},
    {'icon': '❄️', 'label': 'Climatisation'},
    {'icon': '🪵', 'label': 'Menuiserie'},
  ];

  @override
  void initState() {
    super.initState();
    _loadServices();
  }

  void _loadServices() async {
    final services = await _serviceService.getServices();
    setState(() {
      _services = services;
      _isLoading = false;
    });
  }

  void _logout() async {
    await _authService.logout();
    if (mounted) {
      Navigator.pushReplacement(
        context,
        MaterialPageRoute(builder: (_) => const LoginScreen()),
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
          'SERVICY',
          style: TextStyle(
            color: Colors.white,
            fontWeight: FontWeight.bold,
            letterSpacing: 2,
          ),
        ),
        actions: [
          IconButton(
  icon: const Icon(Icons.notifications_outlined, color: Colors.white),
  onPressed: () => Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => NotificationScreen()),
  ),
),
            IconButton(
  icon: const Icon(Icons.person_outline, color: Colors.white),
  onPressed: () => Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => const ProfileScreen()),
  ),
),
            IconButton(
  icon: const Icon(Icons.list_alt, color: Colors.white),
  onPressed: () => Navigator.push(
    context,
    MaterialPageRoute(builder: (_) => const MyAppointmentsScreen()),
  ),
),
          IconButton(
            icon: const Icon(Icons.add_circle_outline, color: Colors.white),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => const AppointmentScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout, color: Colors.white),
            onPressed: _logout,
          ),
        ],
      ),
      body: SingleChildScrollView(
        padding: const EdgeInsets.all(16),
        child: Column(
          crossAxisAlignment: CrossAxisAlignment.start,
          children: [
            const Text(
              'Bonjour 👋',
              style: TextStyle(
                fontSize: 22,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2D1B2E),
              ),
            ),
            const Text(
              'Quel service cherchez-vous ?',
              style: TextStyle(
                fontSize: 14,
                color: Color(0xFFC2185B),
              ),
            ),
            const SizedBox(height: 16),
            TextField(
              onChanged: (v) => setState(() => _searchQuery = v),
              decoration: InputDecoration(
                hintText: 'Rechercher un service...',
                prefixIcon: const Icon(Icons.search, color: Color(0xFF9B1D54)),
                filled: true,
                fillColor: Colors.white,
                border: OutlineInputBorder(
                  borderRadius: BorderRadius.circular(12),
                  borderSide: BorderSide.none,
                ),
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Catégories',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2D1B2E),
              ),
            ),
            const SizedBox(height: 12),
            SizedBox(
              height: 90,
              child: ListView.builder(
                scrollDirection: Axis.horizontal,
                itemCount: _categories.length,
                itemBuilder: (context, index) {
                  return Container(
                    margin: const EdgeInsets.only(right: 12),
                    width: 80,
                    decoration: BoxDecoration(
                      color: Colors.white,
                      borderRadius: BorderRadius.circular(12),
                      boxShadow: [
                        BoxShadow(
                          color: const Color(0xFF9B1D54).withOpacity(0.1),
                          blurRadius: 6,
                          offset: const Offset(0, 2),
                        ),
                      ],
                    ),
                    child: Column(
                      mainAxisAlignment: MainAxisAlignment.center,
                      children: [
                        Text(
                          _categories[index]['icon'],
                          style: const TextStyle(fontSize: 28),
                        ),
                        const SizedBox(height: 4),
                        Text(
                          _categories[index]['label'],
                          style: const TextStyle(
                            fontSize: 10,
                            color: Color(0xFF9B1D54),
                          ),
                          textAlign: TextAlign.center,
                        ),
                      ],
                    ),
                  );
                },
              ),
            ),
            const SizedBox(height: 24),
            const Text(
              'Services disponibles',
              style: TextStyle(
                fontSize: 18,
                fontWeight: FontWeight.bold,
                color: Color(0xFF2D1B2E),
              ),
            ),
            const SizedBox(height: 12),
            _isLoading
                ? const Center(
                    child: CircularProgressIndicator(
                      color: Color(0xFF9B1D54),
                    ),
                  )
                : _services.isEmpty
                    ? Center(
                        child: Column(
                          children: [
                            const SizedBox(height: 20),
                            const Icon(
                              Icons.home_repair_service,
                              size: 60,
                              color: Color(0xFFF48FB1),
                            ),
                            const SizedBox(height: 12),
                            const Text(
                              'Aucun service disponible',
                              style: TextStyle(
                                color: Color(0xFF9B1D54),
                                fontSize: 16,
                              ),
                            ),
                          ],
                        ),
                      )
                    : ListView.builder(
                        shrinkWrap: true,
                        physics: const NeverScrollableScrollPhysics(),
                        itemCount: _services
                            .where((s) => s.title
                                .toLowerCase()
                                .contains(_searchQuery.toLowerCase()))
                            .length,
                        itemBuilder: (context, index) {
                          final filtered = _services
                              .where((s) => s.title
                                  .toLowerCase()
                                  .contains(_searchQuery.toLowerCase()))
                              .toList();
                          final service = filtered[index];
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
                            child: Row(
                              children: [
                                Container(
                                  width: 50,
                                  height: 50,
                                  decoration: BoxDecoration(
                                    color: const Color(0xFFFDF0F5),
                                    borderRadius: BorderRadius.circular(10),
                                  ),
                                  child: const Icon(
                                    Icons.home_repair_service,
                                    color: Color(0xFF9B1D54),
                                  ),
                                ),
                                const SizedBox(width: 12),
                                Expanded(
                                  child: Column(
                                    crossAxisAlignment: CrossAxisAlignment.start,
                                    children: [
                                      Text(
                                        service.title,
                                        style: const TextStyle(
                                          fontWeight: FontWeight.bold,
                                          color: Color(0xFF2D1B2E),
                                        ),
                                      ),
                                      Text(
                                        service.description,
                                        style: const TextStyle(
                                          fontSize: 12,
                                          color: Colors.grey,
                                        ),
                                        maxLines: 1,
                                        overflow: TextOverflow.ellipsis,
                                      ),
                                    ],
                                  ),
                                ),
                                
                                Text(
                                  '${service.price} DT',
                                  style: const TextStyle(
                                    fontWeight: FontWeight.bold,
                                    color: Color(0xFF9B1D54),
                                  ),
                                ),
                              ],
                            ),
                          );
                        },
                      ),
          ],
        ),
      ),
    );
  }
}