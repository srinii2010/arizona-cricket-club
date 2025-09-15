'use client'

import { useState } from 'react'
import Image from 'next/image'

export default function Home() {
  const [isMenuOpen, setIsMenuOpen] = useState(false)

  return (
    <div className="min-h-screen bg-white">
      {/* Top Black Banner */}
      <div className="bg-black text-white py-6">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Left Section: Logo and Club Name */}
            <div className="flex items-center space-x-6">
              {/* ACC Logo */}
              <Image
                src="/acc-logo.png"
                alt="Arizona Cricket Club Logo"
                width={64}
                height={64}
                className="w-16 h-16 object-contain"
              />
              
              <div>
                <h1 className="text-4xl font-bold text-white" style={{fontFamily: 'Dancing Script, cursive'}}>
                  Arizona Cricket Club
                </h1>
                <h2 className="text-sm uppercase tracking-wide text-gray-300 mt-1">
                  HOME OF VIPERS, RATTLERS, BLACK MAMBAS & COBRAS
                </h2>
              </div>
            </div>

            {/* Right Section: Navigation and Join Button */}
            <div className="hidden md:flex items-center space-x-8">
              <nav className="flex space-x-6">
                <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide">HOME</a>
                <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide">TEAMS</a>
                <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide">GALLERY</a>
                <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide">GROUND</a>
                <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide">SPONSORS</a>
                <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide">CALENDAR</a>
                <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide">VIDEO ARCHIVES</a>
                <a href="/admin/login" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide">ADMIN</a>
              </nav>
              <a href="/join" className="bg-yellow-400 text-black px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-yellow-500 transition-colors">
                JOIN ACC
              </a>
            </div>

            {/* Mobile Menu Button */}
            <div className="md:hidden">
              <button 
                onClick={() => setIsMenuOpen(!isMenuOpen)} 
                className="text-white focus:outline-none"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16"></path>
                </svg>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Mobile Menu */}
      {isMenuOpen && (
        <div className="md:hidden bg-gray-800 text-white py-4">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <nav className="flex flex-col space-y-3">
              <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide py-2">HOME</a>
              <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide py-2">TEAMS</a>
              <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide py-2">GALLERY</a>
              <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide py-2">GROUND</a>
              <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide py-2">SPONSORS</a>
              <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide py-2">CALENDAR</a>
              <a href="#" className="text-white hover:text-yellow-400 font-medium text-sm uppercase tracking-wide py-2">VIDEO ARCHIVES</a>
              <a href="/admin/login" className="text-white hover:text-yellow-400 font-medium text-sm py-2">ADMIN CONSOLE</a>
              <a href="/join" className="bg-yellow-400 text-black px-6 py-2 rounded-md text-sm font-bold uppercase tracking-wide hover:bg-yellow-500 transition-colors w-fit mt-2">
                JOIN ACC
              </a>
            </nav>
          </div>
        </div>
      )}

      {/* Hero Image Section - Using Next.js Image */}
      <div className="relative w-full" style={{height: '320px'}}>
        <Image
          src="/test.jpg"
          alt="Arizona Cricket Club Cricket Ground"
          fill
          className="object-cover"
          priority
        />
        <div 
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            width: '100%',
            height: '100%',
            backgroundColor: 'rgba(0, 0, 0, 0.5)',
            zIndex: 2,
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center'
          }}
        >
          <div className="text-center text-white">
            <h2 className="text-5xl font-bold mb-4">Arizona Cricket Club</h2>
            <p className="text-xl mb-2">Established 2003</p>
            <p className="text-lg">Home of Vipers, Rattlers, Black Mambas & Cobras</p>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        {/* Welcome Section */}
        <div className="mb-12">
          <h2 className="text-4xl font-bold text-gray-900 mb-6 text-center">
            WELCOME TO THE ARIZONA CRICKET CLUB&apos;S WEBSITE
          </h2>
          <div className="prose max-w-none text-gray-700 leading-relaxed text-lg">
            <p className="mb-6">
              The club was created in August 2003 to promote the game of Cricket in Arizona as the way the sport was meant to be played. 
              We are the only team in Arizona who has our own ground and play on natural turf wicket.
            </p>
            <p className="mb-6">
              We play with the spirit of good sportsmanship, camaraderie, hospitality, and treat all visiting teams like guests in our home. 
              We provide lunch and beverages at all of our home games to help promote our values and love of the game. Our club is designed to give every player an opportunity to play and participate to help the team win. ACC consists of players from India, Pakistan, Sri Lanka, England and West Indies. We have players who come from as far away as El Paso, Texas and Los Angeles, CA to come play for ACC. We also are one of only two clubs in the Arizona Cricket Association who have our own ground and the only club in Arizona which plays on a turf wicket.
            </p>
            <p className="mb-6">
              We invite everyone to come and join us for practice and be part of the ACC family. It makes no difference if you are new to the game, you played it in your youth, miss the day with the boys, or you want to get back to playing on a regular basis.
            </p>
            <p className="mb-6">
              ACC also is a social club with monthly potlucks for all members and their families. This gives an opportunity to meet each others families, and the kids have an opportunity to build relationships as they grow together and hopefully will be future members of the ACC.
            </p>
            <p className="mb-6">
              Looking forward to you becoming part of Arizona Cricket Club family!
            </p>
          </div>
        </div>

        {/* Philosophy Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">OUR PHILOSOPHY</h3>
          <p className="text-center text-gray-600 mb-8 text-lg">Our core philosophy is quite simple:</p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Everyone Plays</h4>
              <p className="text-gray-700">
                Our goal is to have every team member have a chance to play league and friendly matches as scheduled and as availability permits.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Balanced Teams</h4>
              <p className="text-gray-700">
                Every game the captains will form a team that is as balanced as possible to ensure ACC has a fighting chance of winning every game.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Good Sportsmanship</h4>
              <p className="text-gray-700">
                We strive to create a positive environment based on mutual respect rather than win-at-all costs attitude, and the ideals of our club are designed to foster good sportsmanship in every facet of the game.
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-3">Have Fun</h4>
              <p className="text-gray-700">
                ACC values and respects time commitments made by every member so the bottom line is to play to win the game, play hard and have fun doing it. We are proud of the successes of the past and look forward to every member helping in the future successes of Arizona Cricket Club.
              </p>
            </div>
          </div>
        </div>

        {/* New Player Application Section */}
        <div className="bg-black text-white rounded-lg p-8 mb-12 text-center">
          <h3 className="text-3xl font-bold mb-4">NEW PLAYER APPLICATION</h3>
          <p className="text-xl mb-6">Join Arizona Cricket Club</p>
          <a href="/join" className="bg-white text-black px-8 py-3 rounded-md font-bold text-lg hover:bg-gray-100 transition-colors">
            JOIN THE TEAM
          </a>
        </div>

        {/* Home Ground Section */}
        <div className="bg-white border-2 border-gray-200 rounded-lg p-8 mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-6 text-center">ACC HOME GROUND</h3>
          <p className="text-center text-gray-600 mb-6 text-lg">
            Our home ground is located at the scenic Nichols park basin in Gilbert. Voted as one of the best cricket grounds in the USA, the ground features a meticulously maintained natural turf wicket and lush green outfield.
          </p>
          <div className="grid md:grid-cols-2 gap-8">
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">FROM SKY HARBOR AIRPORT</h4>
              <p className="text-gray-700 text-sm">
                Take 202 East go approximately 4 miles to 101 South. Go another approximate 4 miles to 60 East. You will go approximately 8 miles and exit on Higley, turn right go approximately 2 miles. Look for a sign for Nichols Park on the right just as you pass the Walgreen&apos;s on the SW corner of Higley and Guadalupe. Turn into the gravel drive way and go to the east end of the lot and park facing large mound of dirt and follow the path down to the grounds. (Note: Ground is not visible from Street level)
              </p>
            </div>
            <div>
              <h4 className="text-xl font-semibold text-gray-900 mb-4">FROM TUCSON</h4>
              <p className="text-gray-700 text-sm">
                Take I-10 West to 60 East. You will go approximately 15 miles and exit on Higley, turn right go approximately 2 miles. Look for a sign for Nichols Park on the right just as you pass the Walgreens on the SW corner of Higley and Guadalupe. Turn into the gravel drive way and go to the east end of the lot and park facing large mound of dirt and follow the path down to the grounds. (Note: Ground is not visible from Street level)
              </p>
            </div>
          </div>
        </div>

        {/* Sponsors Section */}
        <div className="bg-gray-50 rounded-lg p-8 mb-12">
          <h3 className="text-3xl font-bold text-gray-900 mb-8 text-center">Proudly Supported by our Sponsors</h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            <div className="text-center p-4 bg-white rounded-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Nova Home Loans</h4>
              <p className="text-sm text-gray-600 mb-2">baldonteam@novahomeloans.com</p>
              <p className="text-xs text-gray-500">(623) 792-6868</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Comparion Insurance Agency</h4>
              <p className="text-sm text-gray-600 mb-2">rishin.patel@comparioninsurance.com</p>
              <p className="text-xs text-gray-500">(623) 707-1035</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Green Muscle Solar</h4>
              <p className="text-sm text-gray-600 mb-2">gackle@greenmusclesolar.com</p>
              <p className="text-xs text-gray-500">(602) 562-7799</p>
            </div>
            <div className="text-center p-4 bg-white rounded-lg">
              <h4 className="text-lg font-bold text-gray-900 mb-2">Medi Weight Loss</h4>
              <p className="text-sm text-gray-600 mb-2">support@mediweightloss.com</p>
              <p className="text-xs text-gray-500">(855) 814-9512</p>
            </div>
          </div>
          <p className="text-center text-gray-600 mt-6">
            Contact us to become an ACC Sponsor: arizonacricketclub.acc@gmail.com
          </p>
        </div>
      </main>

      {/* Footer */}
      <footer className="bg-gray-800 text-white py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <p className="text-lg font-semibold mb-2">©2025 Arizona Cricket Club</p>
          <div className="flex justify-center space-x-6">
            <a href="#" className="text-gray-400 hover:text-white">Facebook</a>
            <a href="#" className="text-gray-400 hover:text-white">Twitter</a>
            <a href="#" className="text-gray-400 hover:text-white">Flickr</a>
          </div>
        </div>
      </footer>
    </div>
  )
}