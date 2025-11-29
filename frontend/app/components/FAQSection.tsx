'use client';

import { useState } from 'react';

interface FAQ {
  id: number;
  question: string;
  answer: string;
}

const faqs: FAQ[] = [
  {
    id: 1,
    question: "Comment passer une commande ?",
    answer: "Vous pouvez passer commande en nous contactant directement par téléphone ou WhatsApp. Notre équipe vous guidera dans le processus et vous aidera à choisir les produits qui vous conviennent."
  },
  {
    id: 2,
    question: "Quels sont les délais de livraison ?",
    answer: "Nous livrons généralement sous 24-48h à Conakry et dans les principales villes de Guinée. Pour les zones plus éloignées, comptez 3-5 jours ouvrables."
  },
  {
    id: 4,
    question: "Comment connaître ma taille ?",
    answer: "Nous proposons un guide des tailles détaillé pour chaque produit. Notre équipe peut également vous conseiller personnellement pour vous assurer de choisir la bonne taille."
  },
  {
    id: 5,
    question: "Quels sont les modes de paiement acceptés ?",
    answer: "Nous acceptons les paiements en espèces à la livraison, les virements bancaires, et les paiements via mobile money (Orange Money, MTN Money)."
  },
  {
    id: 6,
    question: "Livrez-vous dans toute la Guinée ?",
    answer: "Oui, nous livrons dans toutes les régions de Guinée. Les frais de livraison varient selon la distance et sont communiqués lors de la commande."
  }
];

export default function FAQSection() {
  const [openFAQ, setOpenFAQ] = useState<number | null>(null);

  const toggleFAQ = (id: number) => {
    setOpenFAQ(openFAQ === id ? null : id);
  };

  return (
    <div className="bg-gradient-to-br from-neutral-50 to-white py-20">
      <div className="container mx-auto px-4">
        <div className="max-w-4xl mx-auto">
          {/* Header */}
          <div className="text-center mb-16">
            <div className="inline-block bg-gradient-to-r from-accent/10 to-green-500/10 border border-accent/20 px-6 py-2 rounded-full mb-8">
              <span className="text-accent font-bold uppercase text-sm tracking-wider">
                ❓ Questions Fréquentes
              </span>
            </div>
            
            <h2 className="text-4xl md:text-5xl font-black text-neutral-900 mb-6">
              <span className="block">Vous Avez Des</span>
              <span className="text-accent block mt-2">Questions ?</span>
            </h2>
            
            <p className="text-neutral-600 text-lg max-w-2xl mx-auto leading-relaxed">
              Trouvez rapidement les réponses aux questions les plus courantes. 
              Si vous ne trouvez pas ce que vous cherchez, n'hésitez pas à nous contacter !
            </p>
          </div>

          {/* FAQ Items */}
          <div className="space-y-4">
            {faqs.map((faq) => (
              <div
                key={faq.id}
                className="bg-white rounded-2xl border border-neutral-200 shadow-sm hover:shadow-md transition-all duration-300"
              >
                <button
                  onClick={() => toggleFAQ(faq.id)}
                  className="w-full px-8 py-6 text-left flex items-center justify-between hover:bg-neutral-50 rounded-2xl transition-colors duration-200"
                >
                  <h3 className="text-lg font-bold text-neutral-900 pr-4">
                    {faq.question}
                  </h3>
                  <div className={`flex-shrink-0 w-8 h-8 flex items-center justify-center rounded-full bg-gradient-to-r from-accent to-green-500 transition-transform duration-300 ${
                    openFAQ === faq.id ? 'rotate-45' : ''
                  }`}>
                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 6v6m0 0v6m0-6h6m-6 0H6" />
                    </svg>
                  </div>
                </button>
                
                <div className={`overflow-hidden transition-all duration-300 ${
                  openFAQ === faq.id ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                }`}>
                  <div className="px-8 pb-6">
                    <div className="border-t border-neutral-100 pt-6">
                      <p className="text-neutral-600 leading-relaxed">
                        {faq.answer}
                      </p>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Contact CTA */}
          <div className="mt-16 text-center">
            <div className="bg-gradient-to-br from-neutral-900 via-black to-neutral-800 rounded-3xl p-12 relative overflow-hidden">
              {/* Background decoration */}
              <div className="absolute inset-0 bg-gradient-to-r from-accent/10 via-transparent to-green-500/10"></div>
              <div className="absolute top-8 left-8 w-24 h-24 bg-accent/20 rounded-full blur-2xl animate-pulse"></div>
              <div className="absolute bottom-8 right-8 w-32 h-32 bg-green-500/20 rounded-full blur-2xl animate-pulse delay-1000"></div>
              
              <div className="relative">
                <h3 className="text-3xl md:text-4xl font-black text-white mb-4">
                  <span className="bg-gradient-to-r from-white to-neutral-300 bg-clip-text text-transparent">
                    Besoin d'Aide ?
                  </span>
                </h3>
                
                <p className="text-neutral-300 text-lg mb-8 max-w-2xl mx-auto">
                  Notre équipe est là pour vous accompagner. Contactez-nous pour toute question 
                  ou conseil personnalisé !
                </p>
                
                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                  <a
                    href="tel:+224662662958"
                    className="group inline-flex items-center justify-center gap-3 bg-gradient-to-r from-accent to-green-500 hover:from-green-500 hover:to-accent text-black px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl hover:scale-105"
                  >
                    <svg className="w-5 h-5 group-hover:rotate-12 transition-transform" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                    </svg>
                    <span>Appeler</span>
                  </a>
                  
                  <a
                    href="https://wa.me/224662662958"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group inline-flex items-center justify-center gap-3 bg-transparent hover:bg-white/10 text-white px-8 py-4 rounded-2xl font-black uppercase tracking-wide transition-all duration-300 shadow-lg hover:shadow-xl border-2 border-white/30 hover:border-green-400 backdrop-blur-sm"
                  >
                    <svg className="w-5 h-5 group-hover:scale-110 transition-transform" fill="currentColor" viewBox="0 0 24 24">
                      <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413Z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}