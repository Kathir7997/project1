import React from 'react';
import { FaLeaf, FaFacebook, FaTwitter, FaInstagram } from 'react-icons/fa';

const Footer = () => {
    return (
        <footer className="bg-earth-800 text-white mt-auto">
            <div className="container mx-auto px-4 py-8">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {/* About */}
                    <div>
                        <div className="flex items-center space-x-2 mb-4">
                            <FaLeaf className="text-primary-400 text-2xl" />
                            <span className="text-xl font-bold">Agricart</span>
                        </div>
                        <p className="text-earth-200">
                            Connecting farmers directly with consumers for fresh, organic produce. Supporting local agriculture.
                        </p>
                    </div>

                    {/* Quick Links */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Quick Links</h3>
                        <ul className="space-y-2">
                            <li>
                                <a href="#" className="text-earth-200 hover:text-primary-400 transition">
                                    About Us
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-earth-200 hover:text-primary-400 transition">
                                    Contact
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-earth-200 hover:text-primary-400 transition">
                                    Privacy Policy
                                </a>
                            </li>
                            <li>
                                <a href="#" className="text-earth-200 hover:text-primary-400 transition">
                                    Terms of Service
                                </a>
                            </li>
                        </ul>
                    </div>

                    {/* Social Media */}
                    <div>
                        <h3 className="text-lg font-semibold mb-4">Connect With Us</h3>
                        <div className="flex space-x-4">
                            <a href="#" className="text-2xl text-earth-200 hover:text-primary-400 transition">
                                <FaFacebook />
                            </a>
                            <a href="#" className="text-2xl text-earth-200 hover:text-primary-400 transition">
                                <FaTwitter />
                            </a>
                            <a href="#" className="text-2xl text-earth-200 hover:text-primary-400 transition">
                                <FaInstagram />
                            </a>
                        </div>
                    </div>
                </div>

                <div className="border-t border-earth-700 mt-8 pt-6 text-center text-earth-300">
                    <p>&copy; {new Date().getFullYear()} Agricart. All rights reserved.</p>
                </div>
            </div>
        </footer>
    );
};

export default Footer;
