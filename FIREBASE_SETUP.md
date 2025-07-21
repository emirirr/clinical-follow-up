# Firebase Kurulum Rehberi

## 🔥 Firebase Console Ayarları

### 1. Firestore Güvenlik Kuralları

Firebase Console'da aşağıdaki güvenlik kurallarını ayarlayın:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Test koleksiyonu için izin
    match /test/{document} {
      allow read, write: if true;
    }
    
    // Users koleksiyonu için izin
    match /users/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Patients koleksiyonu için izin
    match /patients/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Appointments koleksiyonu için izin
    match /appointments/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Prescriptions koleksiyonu için izin
    match /prescriptions/{document} {
      allow read, write: if request.auth != null;
    }
    
    // TestResults koleksiyonu için izin
    match /testResults/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Doctors koleksiyonu için izin
    match /doctors/{document} {
      allow read, write: if request.auth != null;
    }
    
    // Notifications koleksiyonu için izin
    match /notifications/{document} {
      allow read, write: if request.auth != null;
    }
  }
}
```

### 2. Firebase Console Adımları

1. **Firebase Console'a Git**: https://console.firebase.google.com/
2. **Projenizi Seçin**: `kliniktakip-95901`
3. **Firestore Database'e Git**: Sol menüden "Firestore Database"
4. **Rules Sekmesine Git**: Üst menüden "Rules" sekmesi
5. **Güvenlik Kurallarını Güncelleyin**: Yukarıdaki kuralları yapıştırın
6. **Publish'e Tıklayın**: Değişiklikleri yayınlayın

### 3. Test Etme

1. **Test Sayfasına Git**: http://localhost:8081/firebase-test
2. **"Firebase Bağlantısını Test Et"** butonuna tıklayın
3. **"Firestore Kurallarını Test Et"** butonuna tıklayın
4. **"Kullanıcı Profili Test Et"** butonuna tıklayın (giriş yapmış olmalısınız)

### 4. Olası Hatalar ve Çözümleri

#### Hata: "permission-denied"
**Çözüm**: Firestore güvenlik kurallarını yukarıdaki gibi güncelleyin

#### Hata: "unavailable"
**Çözüm**: İnternet bağlantınızı kontrol edin

#### Hata: "unauthenticated"
**Çözüm**: Kullanıcı giriş yapmış olmalı

#### Hata: "project-not-found"
**Çözüm**: Firebase proje ID'sini kontrol edin

### 5. Firebase Konfigürasyon Kontrolü

`src/lib/firebase.ts` dosyasındaki konfigürasyonun doğru olduğundan emin olun:

```typescript
const firebaseConfig = {
  apiKey: "AIzaSyBALwj-lCresjKXSI2JJvJ_-WHRjkYP1pQ",
  authDomain: "kliniktakip-95901.firebaseapp.com",
  projectId: "kliniktakip-95901",
  storageBucket: "kliniktakip-95901.firebasestorage.app",
  messagingSenderId: "1091367979212",
  appId: "1:1091367979212:web:d02d7850787b881ca89a69",
  measurementId: "G-3FCFDR1LR8"
};
```

### 6. Debug İpuçları

1. **Browser Console'u Açın**: F12 tuşuna basın
2. **Network Sekmesini Kontrol Edin**: Firebase isteklerini görebilirsiniz
3. **Console Loglarını İnceleyin**: Detaylı hata mesajlarını görebilirsiniz

### 7. Test Sonuçları

Başarılı test sonuçları şöyle görünmelidir:

```
✅ Firebase bağlantısı başarılı - okuma testi geçti
✅ Firestore okuma testi başarılı
✅ Firestore yazma testi başarılı, doküman ID: [ID]
✅ Test dokümanı temizlendi
✅ Firestore okuma ve yazma izinleri var
✅ Profil kaydedildi, ID: [ID]
``` 