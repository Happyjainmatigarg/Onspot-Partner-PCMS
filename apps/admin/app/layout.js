import './globals.css';

export const metadata = {
    title: 'OnSpot™ Admin Dashboard',
    description: 'Administration panel for OnSpot device protection services',
};

export default function RootLayout({ children }) {
    return (
        <html lang="en">
            <head>
                <link rel="preconnect" href="https://fonts.googleapis.com" />
                <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
                <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap" rel="stylesheet" />
            </head>
            <body className="min-h-screen bg-gray-50">
                {children}
            </body>
        </html>
    );
}
