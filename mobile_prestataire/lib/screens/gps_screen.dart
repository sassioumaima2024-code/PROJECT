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
  int? _etaMinutes;
  Timer? _timer;

  Future<void> _startGps() async {
    var permission = await Geolocator.checkPermission();
    if (permission == LocationPermission.denied) {
      permission = await Geolocator.requestPermission();
    }
    if (permission == LocationPermission.denied || permission == LocationPermission.deniedForever) return;

    setState(() => _gpsActive = true);
    await _sendPosition();
    _timer = Timer.periodic(const Duration(seconds: 30), (_) => _sendPosition());
  }

  Future<void> _sendPosition() async {
    final pos = await Geolocator.getCurrentPosition();
    await ApiService.patch('/location/update', {
      'latitude': pos.latitude,
      'longitude': pos.longitude,
    });
    setState(() {
      _currentPosition = pos;
      _etaMinutes = 15;
    });
    _mapController?.animateCamera(CameraUpdate.newLatLng(LatLng(pos.latitude, pos.longitude)));
  }

  void _stopGps() {
    _timer?.cancel();
    setState(() {
      _gpsActive = false;
      _currentPosition = null;
      _etaMinutes = null;
    });
  }

  @override
  void dispose() {
    _timer?.cancel();
    super.dispose();
  }

  @override
  Widget build(BuildContext context) {
    final pos = _currentPosition;
    return Scaffold(
      backgroundColor: const Color(0xFFFAF9FF),
      appBar: AppBar(
        flexibleSpace: Container(
          decoration: const BoxDecoration(
            gradient: LinearGradient(colors: [Color(0xFF4F3D8A), Color(0xFF7C5CBF)]),
          ),
        ),
        title: const Text('GPS & Suivi', style: TextStyle(color: Colors.white)),
      ),
      body: Column(children: [
        Expanded(
          child: pos == null
              ? const Center(child: Text('Activez le GPS pour voir votre position'))
              : GoogleMap(
                  initialCameraPosition: CameraPosition(target: LatLng(pos.latitude, pos.longitude), zoom: 15),
                  onMapCreated: (controller) => _mapController = controller,
                  markers: {
                    Marker(
                      markerId: const MarkerId('me'),
                      position: LatLng(pos.latitude, pos.longitude),
                      infoWindow: const InfoWindow(title: 'Ma position'),
                    ),
                  },
                ),
        ),
        Padding(
          padding: const EdgeInsets.all(24),
          child: Column(children: [
            if (_etaMinutes != null)
              Container(
                width: double.infinity,
                margin: const EdgeInsets.only(bottom: 12),
                padding: const EdgeInsets.all(12),
                decoration: BoxDecoration(color: const Color(0xFFF3F0FF), borderRadius: BorderRadius.circular(12)),
                child: Text('ETA estime: $_etaMinutes min', textAlign: TextAlign.center),
              ),
            SizedBox(
              width: double.infinity,
              height: 52,
              child: ElevatedButton.icon(
                style: ElevatedButton.styleFrom(
                  backgroundColor: _gpsActive ? const Color(0xFFDC2626) : const Color(0xFF059669),
                  shape: RoundedRectangleBorder(borderRadius: BorderRadius.circular(16)),
                ),
                icon: Icon(_gpsActive ? Icons.gps_off : Icons.gps_fixed, color: Colors.white),
                label: Text(_gpsActive ? 'Desactiver GPS' : 'Activer GPS', style: const TextStyle(color: Colors.white, fontSize: 16)),
                onPressed: _gpsActive ? _stopGps : _startGps,
              ),
            ),
          ]),
        ),
      ]),
    );
  }
}
