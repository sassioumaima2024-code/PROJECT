import 'package:flutter/material.dart';
import '../../models/service_model.dart';
import '../../models/category_model.dart';
import '../../services/auth_service.dart';
import '../../services/service_service.dart';
import '../../services/category_service.dart';
import '../auth/login_screen.dart';
import '../appointment/appointment_screen.dart';
import '../appointment/my_appointments_screen.dart';
import '../profile/profile_screen.dart';
import '../notification/notification_screen.dart';
import '../../widgets/urgence_button.dart';
import '../../config/app_theme.dart';
import 'package:google_fonts/google_fonts.dart';

class HomeScreen extends StatefulWidget {
  const HomeScreen({super.key});

  @override
  State<HomeScreen> createState() => _HomeScreenState();
}

class _HomeScreenState extends State<HomeScreen> {
  final ServiceService _serviceService = ServiceService();
  final AuthService _authService = AuthService();
  final CategoryService _categoryService = CategoryService();

  List<ServiceModel> _services = [];
  List<CategoryModel> _categories = [];
  bool _isLoading = true;
  String _searchQuery = '';
  int? _selectedCategoryId;

  @override
  void initState() {
    super.initState();
    _loadData();
  }

  void _loadData() async {
    final services = await _serviceService.getServices();
    final categories = await _categoryService.getCategories();
    setState(() {
      _services = services;
      _categories = categories;
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
      backgroundColor: AppTheme.backgroundColor,
      // bottomNavigationBar: _buildBottomNav(),
      appBar: AppBar(
        title: Text(
          'SERVICY',
          style: GoogleFonts.poppins(
            fontWeight: FontWeight.bold,
            letterSpacing: 1.5,
          ),
        ),
        actions: [
          IconButton(
            icon: const Icon(Icons.notifications_outlined),
            onPressed: () => Navigator.push(
              context,
              MaterialPageRoute(builder: (_) => NotificationScreen()),
            ),
          ),
          IconButton(
            icon: const Icon(Icons.logout),
            onPressed: _logout,
          ),
        ],
      ),
      body: _isLoading
          ? const Center(
              child: CircularProgressIndicator(color: Color(0xFF9B1D54)),
            )
          : SingleChildScrollView(
              child: Column(
                crossAxisAlignment: CrossAxisAlignment.start,
                children: [
                  // Header avec dégradé
                  Container(
                    width: double.infinity,
                    padding: const EdgeInsets.all(20),
                    decoration: const BoxDecoration(
                      gradient: LinearGradient(
                        colors: [AppTheme.primaryColor, AppTheme.secondaryColor],
                        begin: Alignment.topLeft,
                        end: Alignment.bottomRight,
                      ),
                      borderRadius: BorderRadius.only(
                        bottomLeft: Radius.circular(32),
                        bottomRight: Radius.circular(32),
                      ),
                    ),
                    child: Column(
                      crossAxisAlignment: CrossAxisAlignment.start,
                      children: [
                        Text(
                          'Bonjour 👋',
                          style: Theme.of(context).textTheme.displaySmall?.copyWith(
                            color: Colors.white,
                            fontWeight: FontWeight.bold,
                          ),
                        ),
                        const SizedBox(height: 4),
                        const Text(
                          'Quel service cherchez-vous ?',
                          style: TextStyle(color: Colors.white70),
                        ),
                        const SizedBox(height: 20),
                        UrgenceButton(onTap: () {
                          // TODO: Navigate to urgent mode
                        }),
                        const SizedBox(height: 20),
                        // Barre de recherche
                        TextField(
                          onChanged: (v) => setState(() => _searchQuery = v),
                          decoration: InputDecoration(
                            hintText: 'Rechercher un service...',
                            prefixIcon: const Icon(Icons.search, color: AppTheme.primaryColor),
                            fillColor: Colors.white,
                            filled: true,
                            border: OutlineInputBorder(
                              borderRadius: BorderRadius.circular(16),
                              borderSide: BorderSide.none,
                            ),
                          ),
                        ),
                      ],
                    ),
                  ),

                  const SizedBox(height: 20),

                  // Catégories depuis la base
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Catégories',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2D1B2E),
                      ),
                    ),
                  ),
                  const SizedBox(height: 12),
                  SizedBox(
                    height: 100,
                    child: ListView.builder(
                      scrollDirection: Axis.horizontal,
                      padding: const EdgeInsets.symmetric(horizontal: 16),
                      itemCount: _categories.length,
                      itemBuilder: (context, index) {
                        final cat = _categories[index];
                        final isSelected = _selectedCategoryId == cat.id;
                        return GestureDetector(
                          onTap: () => setState(() {
                            _selectedCategoryId = isSelected ? null : cat.id;
                          }),
                          child: Container(
                            margin: const EdgeInsets.only(right: 12),
                            width: 80,
                            decoration: BoxDecoration(
                              color: isSelected
                                  ? const Color(0xFF9B1D54)
                                  : Colors.white,
                              borderRadius: BorderRadius.circular(14),
                              boxShadow: [
                                BoxShadow(
                                  color: const Color(0xFF9B1D54).withOpacity(0.15),
                                  blurRadius: 8,
                                  offset: const Offset(0, 3),
                                ),
                              ],
                            ),
                            child: Column(
                              mainAxisAlignment: MainAxisAlignment.center,
                              children: [
                                Text(
                                  cat.icon ?? '🔧',
                                  style: const TextStyle(fontSize: 28),
                                ),
                                const SizedBox(height: 4),
                                Text(
                                  cat.name,
                                  style: TextStyle(
                                    fontSize: 9,
                                    color: isSelected
                                        ? Colors.white
                                        : const Color(0xFF9B1D54),
                                    fontWeight: FontWeight.w600,
                                  ),
                                  textAlign: TextAlign.center,
                                  maxLines: 1,
                                  overflow: TextOverflow.ellipsis,
                                ),
                              ],
                            ),
                          ),
                        );
                      },
                    ),
                  ),

                  const SizedBox(height: 24),

                  // Services
                  const Padding(
                    padding: EdgeInsets.symmetric(horizontal: 16),
                    child: Text(
                      'Services disponibles',
                      style: TextStyle(
                        fontSize: 18,
                        fontWeight: FontWeight.bold,
                        color: Color(0xFF2D1B2E),
                      ),
                    ),
                  ),

                  const SizedBox(height: 12),

                  _services.isEmpty
                      ? Center(
                          child: Padding(
                            padding: const EdgeInsets.all(40),
                            child: Column(
                              children: [
                                Icon(
                                  Icons.home_repair_service,
                                  size: 70,
                                  color: const Color(0xFF9B1D54).withOpacity(0.3),
                                ),
                                const SizedBox(height: 16),
                                const Text(
                                  'Aucun service disponible',
                                  style: TextStyle(
                                    color: Color(0xFF9B1D54),
                                    fontSize: 16,
                                    fontWeight: FontWeight.w500,
                                  ),
                                ),
                                const SizedBox(height: 8),
                                const Text(
                                  'Les prestataires ajouteront bientôt des services',
                                  style: TextStyle(
                                    color: Colors.grey,
                                    fontSize: 13,
                                  ),
                                  textAlign: TextAlign.center,
                                ),
                              ],
                            ),
                          ),
                        )
                      : ListView.builder(
                          shrinkWrap: true,
                          physics: const NeverScrollableScrollPhysics(),
                          padding: const EdgeInsets.symmetric(horizontal: 16),
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
                                borderRadius: BorderRadius.circular(16),
                                boxShadow: [
                                  BoxShadow(
                                    color: const Color(0xFF9B1D54).withOpacity(0.08),
                                    blurRadius: 8,
                                    offset: const Offset(0, 3),
                                  ),
                                ],
                              ),
                              child: Row(
                                children: [
                                  Container(
                                    width: 55,
                                    height: 55,
                                    decoration: BoxDecoration(
                                      gradient: const LinearGradient(
                                        colors: [Color(0xFF9B1D54), Color(0xFFC2185B)],
                                      ),
                                      borderRadius: BorderRadius.circular(14),
                                    ),
                                    child: const Icon(
                                      Icons.home_repair_service,
                                      color: Colors.white,
                                      size: 28,
                                    ),
                                  ),
                                  const SizedBox(width: 14),
                                  Expanded(
                                    child: Column(
                                      crossAxisAlignment: CrossAxisAlignment.start,
                                      children: [
                                        Text(
                                          service.title,
                                          style: const TextStyle(
                                            fontWeight: FontWeight.bold,
                                            color: Color(0xFF2D1B2E),
                                            fontSize: 15,
                                          ),
                                        ),
                                        const SizedBox(height: 4),
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
                                  Container(
                                    padding: const EdgeInsets.symmetric(
                                        horizontal: 10, vertical: 6),
                                    decoration: BoxDecoration(
                                      color: const Color(0xFFFDF0F5),
                                      borderRadius: BorderRadius.circular(10),
                                    ),
                                    child: Text(
                                      '${service.price} DT',
                                      style: const TextStyle(
                                        fontWeight: FontWeight.bold,
                                        color: Color(0xFF9B1D54),
                                        fontSize: 13,
                                      ),
                                    ),
                                  ),
                                ],
                              ),
                            );
                          },
                        ),
                  const SizedBox(height: 20),
                ],
              ),
            ),
    );
  }
}