<?php
// Script to debug categories API
$ch = curl_init();
curl_setopt($ch, CURLOPT_URL, "http://127.0.0.1:8000/api/admin/categories");
curl_setopt($ch, CURLOPT_RETURNTRANSFER, 1);
// Assuming no auth for this test or I'll need a token
// Let's try without auth first to see if we get a 401 JSON or HTML
$output = curl_exec($ch);
$info = curl_getinfo($ch);
curl_close($ch);

echo "Status: " . $info['http_code'] . "\n";
echo "Output: \n" . $output . "\n";
