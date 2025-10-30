// src/pages/Public/Home.jsx
import React from 'react';
import { Link } from 'react-router-dom';
import { Heart, Users, MapPin, Clock } from 'lucide-react';
import { useAuth } from '../../hooks/useAuth';

const Home = () => {
  const { user } = useAuth();

  const features = [
    {
      icon: <MapPin className="w-8 h-8" />,
      title: 'Find Donors Nearby',
      description: 'Locate blood donors in your area using our interactive map.'
    },
    {
      icon: <Users className="w-8 h-8" />,
      title: 'Connect with Hospitals',
      description: 'Partner with hospitals to manage blood supply efficiently.'
    },
    {
      icon: <Clock className="w-8 h-8" />,
      title: 'Quick Response',
      description: 'Get immediate help during emergencies with real-time notifications.'
    },
    {
      icon: <Heart className="w-8 h-8" />,
      title: 'Save Lives',
      description: 'Join our community of donors and make a difference every day.'
    }
  ];

  const stats = [
    { number: '10,000+', label: 'Registered Donors' },
    { number: '500+', label: 'Partner Hospitals' },
    { number: '50,000+', label: 'Lives Saved' },
    { number: '24/7', label: 'Emergency Support' }
  ];

  return (
    <div className="min-h-screen">
      {/* Hero Section */}
      <section className="bg-gradient-to-r from-blood-red to-red-700 text-white py-20">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-5xl font-bold mb-6">
            Donate Blood, Save Lives
          </h1>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Join our community of blood donors and help us ensure that no one dies 
            due to unavailability of blood. Your single donation can save up to 3 lives.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            {!user ? (
              <>
                <Link
                  to="/register"
                  className="bg-white text-blood-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
                >
                  Join Now
                </Link>
                <Link
                  to="/login"
                  className="border-2 border-white text-white px-8 py-3 rounded-lg font-semibold hover:bg-white hover:text-blood-red transition-colors"
                >
                  Sign In
                </Link>
              </>
            ) : (
              <Link
                to="/dashboard"
                className="bg-white text-blood-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
              >
                Go to Dashboard
              </Link>
            )}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-16 bg-gray-50">
        <div className="container mx-auto px-4">
          <h2 className="text-3xl font-bold text-center mb-12">
            How We Help Save Lives
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <div key={index} className="text-center p-6 bg-white rounded-lg shadow-md">
                <div className="text-blood-red mb-4 flex justify-center">
                  {feature.icon}
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-gray-600">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Stats Section */}
      <section className="py-16 bg-white">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {stats.map((stat, index) => (
              <div key={index}>
                <div className="text-3xl font-bold text-blood-red mb-2">
                  {stat.number}
                </div>
                <div className="text-gray-600 font-medium">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-16 bg-blood-red text-white">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Ready to Make a Difference?
          </h2>
          <p className="text-xl mb-8 max-w-2xl mx-auto">
            Your blood donation can give someone another chance at life. 
            Join our community today and start saving lives.
          </p>
          {!user && (
            <Link
              to="/register"
              className="bg-white text-blood-red px-8 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors inline-block"
            >
              Become a Donor
            </Link>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;