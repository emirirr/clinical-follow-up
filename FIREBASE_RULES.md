# Firebase Firestore Güvenlik Kuralları

## 🔥 Sorun: "Missing or insufficient permissions"

Bu hata, Firebase Firestore güvenlik kurallarının çok kısıtlayıcı olmasından kaynaklanıyor.

## 🛠️ Çözüm Adımları

### 1. Firebase Console'a Gidin
- https://console.firebase.google.com/
- `kliniktakip-95901` projesini seçin

### 2. Firestore Database'e Gidin
- Sol menüden "Firestore Database" seçin
- Üst menüden "Rules" sekmesine tıklayın

### 3. Güvenlik Kurallarını Güncelleyin

Mevcut kuralları şu şekilde değiştirin:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Test koleksiyonu için tam erişim (geliştirme için)
    match /test/{document} {
      allow read, write: if true;
    }
    
    // Users koleksiyonu - giriş yapmış kullanıcılar okuyabilir/yazabilir
    match /users/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Patients koleksiyonu - giriş yapmış kullanıcılar okuyabilir/yazabilir
    match /patients/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Appointments koleksiyonu - giriş yapmış kullanıcılar okuyabilir/yazabilir
    match /appointments/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Prescriptions koleksiyonu - giriş yapmış kullanıcılar okuyabilir/yazabilir
    match /prescriptions/{document} {
      allow read, write: if request.auth != null;
    }
    
    // TestResults koleksiyonu - giriş yapmış kullanıcılar okuyabilir/yazabilir
    match /testResults/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Doctors koleksiyonu - giriş yapmış kullanıcılar okuyabilir/yazabilir
    match /doctors/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Notifications koleksiyonu - giriş yapmış kullanıcılar okuyabilir/yazabilir
    match /notifications/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 4. Publish'e Tıklayın
- "Publish" butonuna tıklayın
- Değişikliklerin yayınlanmasını bekleyin

### 5. Test Edin
- Test sayfasına gidin: http://localhost:8081/firebase-test
- "Firestore Kurallarını Test Et" butonuna tıklayın

## 🔒 Güvenlik Açıklaması

Bu kurallar:
- ✅ **Giriş yapmış kullanıcılar** tüm koleksiyonlara erişebilir
- ✅ **Giriş yapmamış kullanıcılar** hiçbir koleksiyona erişemez
- ✅ **Test koleksiyonu** geliştirme için tam erişim sağlar

## 🚨 Önemli Notlar

1. **Geliştirme Ortamı**: Bu kurallar geliştirme için uygundur
2. **Production**: Production'da daha kısıtlayıcı kurallar kullanın
3. **Kullanıcı Rolleri**: İleride rol tabanlı erişim eklenebilir

## 🔍 Hata Kontrolü

Eğer hala hata alıyorsanız:

1. **Console'u Kontrol Edin**: F12 → Console sekmesi
2. **Network Sekmesini Kontrol Edin**: Firebase isteklerini görebilirsiniz
3. **Test Sayfasını Kullanın**: Detaylı hata mesajları için

## 📞 Yardım

Eğer sorun devam ederse:
1. Firebase Console'da projenin aktif olduğunu kontrol edin
2. İnternet bağlantınızı kontrol edin
3. Firebase proje ID'sinin doğru olduğunu kontrol edin 