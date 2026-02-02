import './globals.css';

export const metadata = {
    title: 'OnSpot™ Admin Dashboard | System Management',
    description: 'Administration panel for managing partners, customers, and system settings for OnSpot device protection services.',
    keywords: 'OnSpot, admin, dashboard, partner management, customer management, system settings',
    authors: [{ name: 'Ccommerce Ecosystem Pvt. Ltd.' }],
    creator: 'Ccommerce Ecosystem Pvt. Ltd.',
    publisher: 'Ccommerce Ecosystem Pvt. Ltd.',
    robots: 'noindex, nofollow',
    metadataBase: new URL('https://admin.onspot.one'),
    openGraph: {
        title: 'OnSpot™ Admin Dashboard',
        description: 'System administration panel for OnSpot ecosystem.',
        url: 'https://admin.onspot.one',
        siteName: 'OnSpot Admin',
        locale: 'en_IN',
        type: 'website',
    },
};

export const viewport = {
    width: 'device-width',
    initialScale: 1,
    themeColor: '#0B2545',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800&display=swap" rel="stylesheet" />
                <link rel="icon" href="/favicon.ico" />
                <link rel="apple-touch-icon" href="/logo.png" />
                <meta name="format-detection" content="telephone=no" />
            </head>
            <body className="min-h-screen bg-gray-50">
                {children}
            </body>
        </html>
    );
}
