import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/landing.css';

const LandingPage = () => {
    const navigate = useNavigate();
    const [scrollY, setScrollY] = useState(0);

    useEffect(() => {
        const handleScroll = () => setScrollY(window.scrollY);
        window.addEventListener('scroll', handleScroll);
        return () => window.removeEventListener('scroll', handleScroll);
    }, []);

    const features = [
        {
            icon: '⚙️',
            title: 'Equipment Tracking',
            description: 'Monitor all your equipment in real-time with advanced analytics and predictive maintenance.'
        },
        {
            icon: '📊',
            title: 'Cost Analysis',
            description: 'Calculate downtime costs with Monte Carlo simulations and machine learning predictions.'
        },
        {
            icon: '🔒',
            title: 'Safety First',
            description: 'Biometric validation and immutable audit trails ensure maximum security.'
        },
        {
            icon: '📱',
            title: 'Offline-First',
            description: 'Work seamlessly without internet. Auto-sync when connection is restored.'
        },
        {
            icon: '🤖',
            title: 'AI-Powered',
            description: 'TensorFlow.js predictions help you stay ahead of equipment failures.'
        },
        {
            icon: '👥',
            title: 'Human Impact',
            description: 'Understand the human cost of downtime with advanced visualizations.'
        }
    ];

    const stats = [
        { value: '99.9%', label: 'Uptime' },
        { value: '50K+', label: 'Equipment Tracked' },
        { value: '$2M+', label: 'Costs Saved' },
        { value: '24/7', label: 'Support' }
    ];

    return (
        <div className="landing-page">
            {/* Hero Section */}
            <section className="hero-section" style={{ transform: `translateY(${scrollY * 0.5}px)` }}>
                <div className="hero-gradient"></div>
                <div className="hero-content">
                    <div className="hero-badge">
                        <span className="badge-dot"></span>
                        Next-Gen Equipment Management
                    </div>
                    <h1 className="hero-title">
                        Transform Your
                        <span className="gradient-text"> Equipment Management</span>
                    </h1>
                    <p className="hero-subtitle">
                        Harness the power of AI, predictive analytics, and real-time monitoring
                        to minimize downtime and maximize efficiency.
                    </p>
                    <div className="hero-buttons">
                        <button className="btn-hero-primary" onClick={() => navigate('/dashboard')}>
                            Get Started
                            <span className="btn-arrow">→</span>
                        </button>
                        <button className="btn-hero-secondary">
                            Watch Demo
                            <span className="play-icon">▶</span>
                        </button>
                    </div>
                    <div className="hero-stats">
                        {stats.map((stat, index) => (
                            <div key={index} className="stat-item">
                                <div className="stat-value">{stat.value}</div>
                                <div className="stat-label">{stat.label}</div>
                            </div>
                        ))}
                    </div>
                </div>
                <div className="hero-visual">
                    <div className="floating-card card-1">
                        <div className="card-icon">📈</div>
                        <div className="card-text">Real-time Analytics</div>
                    </div>
                    <div className="floating-card card-2">
                        <div className="card-icon">🎯</div>
                        <div className="card-text">Predictive AI</div>
                    </div>
                    <div className="floating-card card-3">
                        <div className="card-icon">💰</div>
                        <div className="card-text">Cost Optimization</div>
                    </div>
                </div>
            </section>

            {/* Features Section */}
            <section className="features-section">
                <div className="section-header">
                    <h2 className="section-title">Powerful Features</h2>
                    <p className="section-subtitle">Everything you need to manage equipment like a pro</p>
                </div>
                <div className="features-grid">
                    {features.map((feature, index) => (
                        <div key={index} className="feature-card" style={{ animationDelay: `${index * 0.1}s` }}>
                            <div className="feature-icon">{feature.icon}</div>
                            <h3 className="feature-title">{feature.title}</h3>
                            <p className="feature-description">{feature.description}</p>
                            <div className="feature-arrow">→</div>
                        </div>
                    ))}
                </div>
            </section>

            {/* Technology Section */}
            <section className="tech-section">
                <div className="tech-container">
                    <div className="tech-content">
                        <h2 className="tech-title">Built with Cutting-Edge Technology</h2>
                        <p className="tech-description">
                            Leveraging the latest in web technologies, machine learning, and data visualization
                            to deliver unparalleled performance and insights.
                        </p>
                        <div className="tech-stack">
                            <div className="tech-badge">React</div>
                            <div className="tech-badge">TensorFlow.js</div>
                            <div className="tech-badge">D3.js</div>
                            <div className="tech-badge">PostgreSQL</div>
                            <div className="tech-badge">WebAuthn</div>
                            <div className="tech-badge">CRDT</div>
                        </div>
                    </div>
                    <div className="tech-visual">
                        <div className="tech-circle circle-1"></div>
                        <div className="tech-circle circle-2"></div>
                        <div className="tech-circle circle-3"></div>
                    </div>
                </div>
            </section>

            {/* CTA Section */}
            <section className="cta-section">
                <div className="cta-content">
                    <h2 className="cta-title">Ready to Transform Your Operations?</h2>
                    <p className="cta-subtitle">Join thousands of companies already using Gear-Guard</p>
                    <button className="btn-cta" onClick={() => navigate('/dashboard')}>
                        Start Free Trial
                        <span className="cta-sparkle">✨</span>
                    </button>
                </div>
            </section>

            {/* Footer */}
            <footer className="landing-footer">
                <div className="footer-content">
                    <div className="footer-brand">
                        <h3 className="footer-logo">⚙️ Gear-Guard</h3>
                        <p className="footer-tagline">Next-gen equipment management</p>
                    </div>
                    <div className="footer-links">
                        <div className="footer-column">
                            <h4>Product</h4>
                            <a href="#features">Features</a>
                            <a href="#pricing">Pricing</a>
                            <a href="#demo">Demo</a>
                        </div>
                        <div className="footer-column">
                            <h4>Company</h4>
                            <a href="#about">About</a>
                            <a href="#careers">Careers</a>
                            <a href="#contact">Contact</a>
                        </div>
                        <div className="footer-column">
                            <h4>Resources</h4>
                            <a href="#docs">Documentation</a>
                            <a href="#blog">Blog</a>
                            <a href="#support">Support</a>
                        </div>
                    </div>
                </div>
                <div className="footer-bottom">
                    <p>&copy; 2025 Gear-Guard. All rights reserved.</p>
                </div>
            </footer>
        </div>
    );
};

export default LandingPage;
