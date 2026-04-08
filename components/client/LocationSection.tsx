import { Mail, MapPin, Phone } from 'lucide-react'
import { PiTelegramLogo } from "react-icons/pi";
import React from 'react'
import { FaInstagram } from 'react-icons/fa';

const LocationSection = () => {
  return (
    <section id="location" className="bg-gray-950 py-20 sm:py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-8">
        <div className="text-center mb-14">
          <h2 className="text-3xl sm:text-4xl font-bold text-white mb-4">Bizning manzil</h2>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto">
            Do&apos;konimizga tashrif buyuring va mahsulotlarimizni o&apos;z ko&apos;zingiz bilan ko&apos;ring
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 items-stretch">
          {/* Contact info */}
          <div className="lg:col-span-2 bg-gray-900/60 backdrop-blur-sm rounded-2xl border border-gray-800 p-6 sm:p-8">
            <h3 className="text-xl font-bold text-white mb-6">Aloqa ma&apos;lumotlari</h3>

            <div className="space-y-5">
              <ContactItem icon={<MapPin className="size-5" />} label="Manzil">
                <p className="text-gray-300">Andijon shahar, Boburshox ko&apos;chasi, 26 uy</p>
              </ContactItem>

              <ContactItem icon={<Phone className="size-5" />} label="Telefon">
                <a href="tel:+998880039000" className="text-gray-300 hover:text-[#00bad8] transition-colors block">+998 88 003 9000</a>
                <a href="tel:+998990039000" className="text-gray-300 hover:text-[#00bad8] transition-colors block">+998 99 003 9000</a>
              </ContactItem>

              <ContactItem icon={<PiTelegramLogo className="size-5" />} label="Telegram">
                <a href="https://t.me/megahomeuz" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#00bad8] transition-colors">
                  @megahomeuz
                </a>
              </ContactItem>

              <ContactItem icon={<Mail className="size-5" />} label="Email">
                <a href="mailto:Megahomeweb@gmail.com" className="text-gray-300 hover:text-[#00bad8] transition-colors">
                  Megahomeweb@gmail.com
                </a>
              </ContactItem>

              <ContactItem icon={<FaInstagram className="size-5" />} label="Instagram">
                <a href="https://www.instagram.com/megahome.ulgurji" target="_blank" rel="noreferrer" className="text-gray-300 hover:text-[#00bad8] transition-colors">
                  @megahome.ulgurji
                </a>
              </ContactItem>
            </div>
          </div>

          {/* Map */}
          <div className="lg:col-span-3 rounded-2xl overflow-hidden border border-gray-800 min-h-[320px] lg:min-h-0">
            <iframe
              className="size-full min-h-[320px]"
              src="https://www.google.com/maps/embed?pb=!1m14!1m8!1m3!1d1665.0809943093248!2d72.35475205284405!3d40.757938844846535!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x38bced6b92db4ad7%3A0x49234e89ae2c8833!2sMEGA%20HOME!5e0!3m2!1sen!2sus!4v1707729952035!5m2!1sen!2sus"
              width="600"
              height="450"
              style={{ border: 0 }}
              allowFullScreen
              loading="lazy"
              referrerPolicy="no-referrer-when-downgrade"
            />
          </div>
        </div>
      </div>
    </section>
  )
}

function ContactItem({ icon, label, children }: { icon: React.ReactNode; label: string; children: React.ReactNode }) {
  return (
    <div className="flex items-start gap-4">
      <div className="shrink-0 flex items-center justify-center size-10 rounded-xl bg-gray-800 text-[#00bad8]">
        {icon}
      </div>
      <div>
        <p className="text-sm font-medium text-gray-500 mb-0.5">{label}</p>
        {children}
      </div>
    </div>
  );
}

export default LocationSection
