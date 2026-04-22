import 'dart:async';
import 'package:flutter/material.dart';
import 'package:geolocator/geolocator.dart';
import 'package:google_maps_flutter/google_maps_flutter.dart';
import 'package:mobile_prestataire/services/api_service.dart';

class GpsScreen extends StatefulWidget {
  const GpsScreen({super.key});
  @override
  State<GpsScreen> createState() => _GpsScreenState();
}

class _GpsScreenState extends State<GpsScreen> {
  GoogleMapController? _mapController;
  Position? _currentPosition;
  bool _gpsActive = false;
  Timer? _timer;

  Future<void> _startGps() async {
    LocationPermission perm = await Geolocator.requestPermission();
    if (perm == LocationPermission.denied) return;

    setState(() => _gpsActive = true);

    _timer = Timer.periodic(const Duration(seconds: 30), (_) async {
      final pos = await Geolocator.getCurrentPosition();
      setState(() => _currentPosition = pos);
      await ApiService.patch('/location/update', {
        'latitude':  pos.latitude,
        'longitude': pos.longitude,
      });
    });

    final pos = await Geolocator.getCurrentPosition();
    setState(() => _currentPosition = pos);
  }

  void _stopGps() {
    _timer?.cancel();
    setState(() { _gpsActive = false; _currentPosition = null; });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(
                colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]))),
        title: const Text('GPS & Suivi', style: TextStyle(color: Colors.white)),
      ),
      body: Column(children: [
        Expanded(
          child: _currentPosition == null
              ? const Center(child: Text('Activez le GPS pour voir votre position'))
              : GoogleMap(
                  initialCameraPosition: CameraPosition(
                    target: LatLng(
                        _currentPosition!.latitude,
                        _currentPosition!.longitude),
                    zoom: 15,
                  ),
                  onMapCreated: (c) => _mapController = c,
                  markers: _currentPosition == null ? {} : {
                    Marker(
                      markerId: const MarkerId('me'),
                      position: LatLng(
                          _currentPosition!.latitude,
                          _currentPosition!.longitude),
                      infoWindow: const InfoWindow(title: 'Ma position'),
                    ),
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(24),
          child: SizedBox(
            width: double.infinity,
            height: 52,
            child: ElevatedButton.icon(
              style: ElevatedButton.styleFrom(
                backgroundColor: _gpsActive
                    ? const Color(0xFFDC2626)
                    : const Color(0xFF059669),
                shape: RoundedRectangleBorder(
                    borderRadius: BorderRadius.circular(16)),
              ),
              icon: Icon(
                  _gpsActive ? Icons.gps_off : Icons.gps_fixed,
                  color: Colors.white),
              label: Text(
                _gpsActive ? 'Désactiver GPS' : 'Activer GPS',
                style: const TextStyle(color: Colors.white, fontSize: 16),
              ),
              onPressed: _gpsActive ? _stopGps : _startGps,
            ),
          ),
        ),
      ]),
    );
  }
}