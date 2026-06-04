export const translations: Record<string, Record<string, string>> = {
  // Navigation
  "nav.home": {
    en: "Home",
    tr: "Anasayfa",
    es: "Inicio",
    fr: "Accueil",
    de: "Startseite"
  },
  "nav.bins": {
    en: "Bin Management",
    tr: "Raf Yönetimi",
    es: "Gestión de Ubicaciones",
    fr: "Gestion des Bacs",
    de: "Behälterverwaltung"
  },
  "nav.settings": {
    en: "Settings",
    tr: "Ayarlar",
    es: "Configuración",
    fr: "Paramètres",
    de: "Einstellungen"
  },

  // Onboarding
  "onboarding.welcome": {
    en: "Welcome! 👋",
    tr: "Hoş Geldiniz! 👋",
    es: "¡Bienvenido! 👋",
    fr: "Bienvenue! 👋",
    de: "Willkommen! 👋"
  },
  "onboarding.wizard.title": {
    en: "Setup Wizard",
    tr: "Kurulum Sihirbazı",
    es: "Asistente de Configuración",
    fr: "Assistant de Configuration",
    de: "Einrichtungsassistent"
  },
  "onboarding.wizard.desc": {
    en: "To start using Simple Bin Locator, we need to set up how bin locations will be stored in Shopify. This takes just 10 seconds!",
    tr: "Simple Bin Locator uygulamasını kullanmaya başlamak için raf konumlarını Shopify'da nasıl tutacağımızı ayarlamamız gerekiyor. Bu işlem sadece 10 saniyenizi alacak!",
    es: "Para empezar a usar Simple Bin Locator, necesitamos configurar cómo se almacenarán las ubicaciones en Shopify. ¡Esto toma solo 10 segundos!",
    fr: "Pour commencer à utiliser Simple Bin Locator, nous devons configurer le stockage des emplacements dans Shopify. Cela ne prend que 10 secondes!",
    de: "Um Simple Bin Locator zu nutzen, müssen wir einrichten, wie Behälterstandorte in Shopify gespeichert werden. Das dauert nur 10 Sekunden!"
  },
  "onboarding.settings.title": {
    en: "Bin Location Settings",
    tr: "Raf Konumu Ayarları",
    es: "Ajustes de Ubicación",
    fr: "Paramètres d'Emplacement",
    de: "Behältereinstellungen"
  },
  "onboarding.choice.title": {
    en: "Did you already create a 'Bin Location' metafield for your products in Shopify?",
    tr: "Daha önce Shopify'da ürünleriniz için bir 'Raf Konumu' metafield'ı oluşturmuş muydunuz?",
    es: "¿Ya creaste un metacampo de 'Ubicación' para tus productos en Shopify?",
    fr: "Avez-vous déjà créé un champ méta 'Emplacement' pour vos produits dans Shopify?",
    de: "Haben Sie bereits ein 'Behälterstandort'-Metafeld für Ihre Produkte in Shopify erstellt?"
  },
  "onboarding.choice.auto": {
    en: "No, create everything automatically for me",
    tr: "Hayır, benim için her şeyi otomatik oluştur",
    es: "No, crea todo automáticamente para mí",
    fr: "Non, tout créer automatiquement pour moi",
    de: "Nein, alles automatisch für mich erstellen"
  },
  "onboarding.choice.auto.help": {
    en: "The app will set up everything in the background. Recommended.",
    tr: "Uygulama sizin için arka planda her şeyi ayarlar. Önerilen.",
    es: "La aplicación configurará todo en segundo plano. Recomendado.",
    fr: "L'application configurera tout en arrière-plan. Recommandé.",
    de: "Die App richtet alles im Hintergrund ein. Empfohlen."
  },
  "onboarding.choice.custom": {
    en: "Yes, I have an existing metafield I use",
    tr: "Evet, halihazırda kullandığım bir metafield var",
    es: "Sí, tengo un metacampo existente que uso",
    fr: "Oui, j'utilise un champ méta existant",
    de: "Ja, ich verwende ein bestehendes Metafeld"
  },
  "onboarding.choice.custom.help": {
    en: "You can enter your own Namespace and Key values.",
    tr: "Kendi kullandığınız Namespace ve Key değerlerini girebilirsiniz.",
    es: "Puedes ingresar tus propios valores de Namespace y Key.",
    fr: "Vous pouvez saisir vos propres valeurs d'Espace de noms et de Clé.",
    de: "Sie können Ihre eigenen Namespace- und Key-Werte eingeben."
  },
  "onboarding.custom.instruction": {
    en: "Enter your metafield details below.",
    tr: "Kullandığınız metafield bilgilerini aşağıya girin.",
    es: "Ingresa los detalles de tu metacampo a continuación.",
    fr: "Saisissez les détails de votre champ méta ci-dessous.",
    de: "Geben Sie unten Ihre Metafeld-Details ein."
  },
  "onboarding.button.finish": {
    en: "Complete Setup and Start",
    tr: "Kurulumu Tamamla ve Başla",
    es: "Completar Configuración y Empezar",
    fr: "Terminer la Configuration et Commencer",
    de: "Einrichtung abschließen und starten"
  },
  
  // Settings Page
  "settings.title": {
    en: "Settings",
    tr: "Ayarlar",
    es: "Configuración",
    fr: "Paramètres",
    de: "Einstellungen"
  },
  "settings.save": {
    en: "Save Changes",
    tr: "Değişiklikleri Kaydet",
    es: "Guardar Cambios",
    fr: "Enregistrer les modifications",
    de: "Änderungen speichern"
  },
  "settings.metafield.title": {
    en: "Metafield Configuration",
    tr: "Metafield Yapılandırması",
    es: "Configuración del Metacampo",
    fr: "Configuration du Champ Méta",
    de: "Metafeld-Konfiguration"
  },
  "settings.metafield.desc": {
    en: "Enter the namespace and key of your bin location metafield. This determines which field is used on the Bin Management page and when order webhooks trigger.",
    tr: "Ürün varyantlarınızdaki raf konumu metafield'ının namespace ve key değerlerini girin. Bu değerler, webhook tetiklendiğinde ve Raf Yönetimi ekranında hangi alanın kullanılacağını belirler.",
    es: "Ingresa el namespace y key de tu metacampo de ubicación. Esto determina qué campo se usa en la página de Gestión y cuando se activan los webhooks de pedidos.",
    fr: "Saisissez l'espace de noms et la clé de votre champ méta d'emplacement. Cela détermine quel champ est utilisé sur la page de Gestion et lorsque les webhooks de commande se déclenchent.",
    de: "Geben Sie den Namespace und Key Ihres Behälterstandort-Metafelds ein. Dies bestimmt, welches Feld auf der Verwaltungsseite und bei Bestellauslösern verwendet wird."
  },
  "settings.note.title": {
    en: "Order Note Format",
    tr: "Sipariş Notu Formatı",
    es: "Formato de Nota de Pedido",
    fr: "Format de Note de Commande",
    de: "Bestellnotizformat"
  },
  "settings.note.label": {
    en: "Note Prefix",
    tr: "Not Başlığı",
    es: "Prefijo de Nota",
    fr: "Préfixe de Note",
    de: "Notiz-Präfix"
  },
  "settings.note.help": {
    en: "The header text added to the beginning of the order note.",
    tr: "Sipariş notunun başına eklenecek başlık metni",
    es: "El texto de encabezado agregado al principio de la nota del pedido.",
    fr: "Le texte d'en-tête ajouté au début de la note de commande.",
    de: "Der Kopfzeilentext, der am Anfang der Bestellnotiz hinzugefügt wird."
  },
  "settings.preview": {
    en: "Preview:",
    tr: "Önizleme:",
    es: "Vista previa:",
    fr: "Aperçu:",
    de: "Vorschau:"
  },
  "settings.preview.example1": {
    en: "• [SKU-001] Sample Product (Red / M) → A-12-3 (x2)",
    tr: "• [SKU-001] Örnek Ürün (Kırmızı / M) → A-12-3 (x2)",
    es: "• [SKU-001] Producto de muestra (Rojo / M) → A-12-3 (x2)",
    fr: "• [SKU-001] Produit d'exemple (Rouge / M) → A-12-3 (x2)",
    de: "• [SKU-001] Beispielprodukt (Rot / M) → A-12-3 (x2)"
  },
  "settings.preview.example2": {
    en: "• [SKU-002] Another Product (Blue / L) → B-05-1 (x1)",
    tr: "• [SKU-002] Başka Ürün (Mavi / L) → B-05-1 (x1)",
    es: "• [SKU-002] Otro producto (Azul / L) → B-05-1 (x1)",
    fr: "• [SKU-002] Autre produit (Bleu / L) → B-05-1 (x1)",
    de: "• [SKU-002] Anderes Produkt (Blau / L) → B-05-1 (x1)"
  },
  "settings.help.title": {
    en: "Help",
    tr: "Yardım",
    es: "Ayuda",
    fr: "Aide",
    de: "Hilfe"
  },
  "settings.help.metafield": {
    en: "What is a Metafield?",
    tr: "Metafield Nedir?",
    es: "¿Qué es un Metacampo?",
    fr: "Qu'est-ce qu'un Champ Méta?",
    de: "Was ist ein Metafeld?"
  },
  "settings.help.metafield.desc": {
    en: "Metafields are custom data fields added to Shopify product variants. You must assign a metafield to each variant to store bin locations.",
    tr: "Metafield'lar, Shopify ürün varyantlarına eklenen özel veri alanlarıdır. Raf konumlarını saklamak için her varyanta bir metafield atamanız gerekir.",
    es: "Los metacampos son campos de datos personalizados agregados a las variantes de productos de Shopify. Debes asignar un metacampo a cada variante para almacenar ubicaciones.",
    fr: "Les champs méta sont des champs de données personnalisés ajoutés aux variantes de produits Shopify. Vous devez attribuer un champ méta à chaque variante pour stocker les emplacements.",
    de: "Metafelder sind benutzerdefinierte Datenfelder, die zu Shopify-Produktvarianten hinzugefügt werden. Sie müssen jeder Variante ein Metafeld zuweisen, um Standorte zu speichern."
  },
  "settings.help.bins": {
    en: "Bin Management",
    tr: "Raf Yönetimi",
    es: "Gestión de Ubicaciones",
    fr: "Gestion des Bacs",
    de: "Behälterverwaltung"
  },
  "settings.help.bins.desc": {
    en: "Thanks to our 'Bin Management' page, you can easily manage the bin locations of all your products from a single screen without entering Shopify settings at all.",
    tr: "Uygulamamızın 'Raf Yönetimi' sayfası sayesinde Shopify ayarlarına hiç girmeden tüm ürünlerinizin raf konumlarını tek bir ekrandan kolayca yönetebilirsiniz.",
    es: "Gracias a nuestra página de 'Gestión de Ubicaciones', puedes administrar fácilmente las ubicaciones de todos tus productos desde una sola pantalla sin ingresar a la configuración de Shopify.",
    fr: "Grâce à notre page de 'Gestion des Bacs', vous pouvez facilement gérer les emplacements de tous vos produits depuis un seul écran sans entrer dans les paramètres de Shopify.",
    de: "Dank unserer 'Behälterverwaltung'-Seite können Sie die Behälterstandorte all Ihrer Produkte einfach auf einem einzigen Bildschirm verwalten, ohne die Shopify-Einstellungen aufzurufen."
  },

  // Bins Page
  "bins.title": {
    en: "Bulk Bin Management",
    tr: "Toplu Raf Yönetimi",
    es: "Gestión Masiva de Ubicaciones",
    fr: "Gestion en Masse des Bacs",
    de: "Massen-Behälterverwaltung"
  },
  "bins.subtitle": {
    en: "Quickly set warehouse or in-store bin locations for your products.",
    tr: "Ürünlerinizin depo veya mağaza içi raf konumlarını hızlıca belirleyin.",
    es: "Configura rápidamente las ubicaciones de almacén o tienda para tus productos.",
    fr: "Définissez rapidement les emplacements d'entrepôt ou en magasin pour vos produits.",
    de: "Legen Sie schnell Lager- oder Filialbehälterstandorte für Ihre Produkte fest."
  },
  "bins.save": {
    en: "Save Changes",
    tr: "Değişiklikleri Kaydet",
    es: "Guardar Cambios",
    fr: "Enregistrer",
    de: "Änderungen speichern"
  },
  "bins.col.product": {
    en: "Product",
    tr: "Ürün",
    es: "Producto",
    fr: "Produit",
    de: "Produkt"
  },
  "bins.col.sku": {
    en: "SKU",
    tr: "SKU",
    es: "SKU",
    fr: "SKU",
    de: "SKU"
  },
  "bins.col.bin": {
    en: "Bin Location",
    tr: "Raf Konumu",
    es: "Ubicación",
    fr: "Emplacement",
    de: "Behälterstandort"
  },
  "bins.col.status": {
    en: "Status",
    tr: "Durum",
    es: "Estado",
    fr: "Statut",
    de: "Status"
  },
  "bins.placeholder": {
    en: "e.g. A-12-3",
    tr: "Örn: A-12-3",
    es: "ej. A-12-3",
    fr: "ex. A-12-3",
    de: "z.B. A-12-3"
  },
  "bins.badge.changed": {
    en: "Changed (Unsaved)",
    tr: "Değiştirildi (Kaydedilmedi)",
    es: "Cambiado (Sin guardar)",
    fr: "Modifié (Non enregistré)",
    de: "Geändert (Ungespeichert)"
  },
  "bins.badge.assigned": {
    en: "Assigned",
    tr: "Atandı",
    es: "Asignado",
    fr: "Attribué",
    de: "Zugewiesen"
  },
  "bins.badge.empty": {
    en: "Empty",
    tr: "Boş",
    es: "Vacío",
    fr: "Vide",
    de: "Leer"
  },
  "bins.error.fetch": {
    en: "An error occurred while fetching products.",
    tr: "Ürünler getirilirken bir hata oluştu.",
    es: "Ocurrió un error al obtener los productos.",
    fr: "Une erreur s'est produite lors de la récupération des produits.",
    de: "Beim Abrufen der Produkte ist ein Fehler aufgetreten."
  },
  "bins.error.nodata": {
    en: "No data to send.",
    tr: "Gönderilecek veri bulunamadı.",
    es: "No hay datos para enviar.",
    fr: "Aucune donnée à envoyer.",
    de: "Keine Daten zum Senden."
  },
  "bins.error.invalid": {
    en: "Invalid update list.",
    tr: "Geçerli bir güncelleme listesi yok.",
    es: "Lista de actualización inválida.",
    fr: "Liste de mise à jour non valide.",
    de: "Ungültige Aktualisierungsliste."
  },
  "bins.error.shopify": {
    en: "A Shopify error occurred while updating some locations.",
    tr: "Bazı konumlar güncellenirken Shopify tarafında hata oluştu.",
    es: "Ocurrió un error de Shopify al actualizar algunas ubicaciones.",
    fr: "Une erreur Shopify s'est produite lors de la mise à jour de certains emplacements.",
    de: "Beim Aktualisieren einiger Standorte ist ein Shopify-Fehler aufgetreten."
  },
  "bins.error.server": {
    en: "A server error occurred.",
    tr: "Sunucu tarafında bir hata oluştu.",
    es: "Ocurrió un error en el servidor.",
    fr: "Une erreur de serveur s'est produite.",
    de: "Ein Serverfehler ist aufgetreten."
  },
  "bins.success.message": {
    en: "{count} products updated successfully!",
    tr: "{count} ürün başarıyla güncellendi!",
    es: "¡{count} productos actualizados con éxito!",
    fr: "{count} produits mis à jour avec succès!",
    de: "{count} Produkte erfolgreich aktualisiert!"
  },
  "bins.toast.setup": {
    en: "Setup complete!",
    tr: "Kurulum tamamlandı!",
    es: "¡Configuración completada!",
    fr: "Configuration terminée!",
    de: "Einrichtung abgeschlossen!"
  },
  "bins.toast.saved": {
    en: "Settings saved successfully.",
    tr: "Ayarlar başarıyla kaydedildi.",
    es: "Ajustes guardados con éxito.",
    fr: "Paramètres enregistrés avec succès.",
    de: "Einstellungen erfolgreich gespeichert."
  }
};

export function getT(locale: string) {
  // Extract language code (e.g., 'en-US' -> 'en')
  const lang = locale.split('-')[0].toLowerCase();
  
  // Default to English if the language is not supported
  const supportedLangs = ['en', 'tr', 'es', 'fr', 'de'];
  const finalLang = supportedLangs.includes(lang) ? lang : 'en';

  return (key: string, replacements?: Record<string, string | number>) => {
    const textEntry = translations[key];
    if (!textEntry) return key;

    let text = textEntry[finalLang] || textEntry['en'] || key;
    
    if (replacements) {
      for (const [k, v] of Object.entries(replacements)) {
        text = text.replace(`{${k}}`, String(v));
      }
    }
    
    return text;
  };
}
