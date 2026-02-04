export default function LocaleHome() {
  return (
    <div className="container mx-auto p-8 text-center">
      <h1 className="text-4xl font-bold mb-4">🎉 i18n Works!</h1>
      <p className="text-lg mb-4">
        If you see this, the [locale] layout is working correctly. Header +
        LanguageSwitcher are in the root layout above.
      </p>
      <p className="text-sm text-muted-foreground">
        This is a temporary test page. Real home page will be migrated in PROMPT
        #5.
      </p>
    </div>
  );
}

