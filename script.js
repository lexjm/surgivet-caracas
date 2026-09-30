/**
 * SURGIVET CARACAS - LÓGICA INTERACTIVA Y CALCULADORA QUIRÚRGICA
 * Especialistas en Cesáreas y Cirugías de Alta Complejidad
 */

document.addEventListener('DOMContentLoaded', () => {
  initCostCalculator();
  initCareGuideTabs();
  initFaqAccordion();
  initModalHandling();
  initMobileNav();
});

/* ==========================================================================
   1. CALCULADORA INTERACTIVA DE PRESUPUESTO QUIRÚRGICO
   ========================================================================== */
function initCostCalculator() {
  const speciesBtns = document.querySelectorAll('.species-btn');
  const surgerySelect = document.getElementById('calc-surgery-type');
  const weightRadios = document.querySelectorAll('input[name="calc-weight"]');
  const examCheckboxes = document.querySelectorAll('input[name="calc-exam"]');
  
  // Elementos de salida
  const totalAmountEl = document.getElementById('calc-total-amount');
  const surgeryBasePriceEl = document.getElementById('calc-base-price');
  const weightAdjPriceEl = document.getElementById('calc-weight-price');
  const examsPriceEl = document.getElementById('calc-exams-price');
  const whatsappQuoteBtn = document.getElementById('calc-whatsapp-btn');
  const summarySurgeryNameEl = document.getElementById('summary-surgery-name');

  // Precios base referenciales en USD para Caracas
  const surgeryPrices = {
    'cesarea-programada': { name: 'Cesárea Programada + Reanimación Neonatal', dog: 380, cat: 320, neonatal: true },
    'cesarea-urgencia': { name: 'Cesárea de Urgencia 24h (Distocia)', dog: 490, cat: 420, neonatal: true },
    'piometra-emergencia': { name: 'Piómetra de Urgencia (Ovariohisterectomía)', dog: 450, cat: 380, neonatal: false },
    'torsion-gastrica': { name: 'Gastropexia / Torsión Gástrica (GDV)', dog: 650, cat: 580, neonatal: false },
    'cuerpo-extrano': { name: 'Enterotomía / Gastrotomía por Obstrucción', dog: 480, cat: 420, neonatal: false },
    'esterilizacion-laparoscopica': { name: 'Esterilización Mínima Invasión (Laparoscopia)', dog: 290, cat: 240, neonatal: false },
    'osteosintesis-fractura': { name: 'Fijación de Fractura con Placa de Titanio', dog: 620, cat: 520, neonatal: false },
    'mastectomia-oncologica': { name: 'Mastectomía Radical / Cirugía Oncológica', dog: 420, cat: 360, neonatal: false }
  };

  const weightMultipliers = {
    'under5': 0,
    '5to15': 30,
    '15to30': 60,
    'over30': 100
  };

  let currentSpecies = 'dog';

  // Cambio de especie (Perro / Gato)
  speciesBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      speciesBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      currentSpecies = btn.dataset.species;
      calculateEstimate();
    });
  });

  // Listeners de cambios
  if (surgerySelect) surgerySelect.addEventListener('change', calculateEstimate);
  weightRadios.forEach(radio => radio.addEventListener('change', calculateEstimate));
  examCheckboxes.forEach(cb => cb.addEventListener('change', calculateEstimate));

  function calculateEstimate() {
    const selectedSurgeryKey = surgerySelect ? surgerySelect.value : 'cesarea-programada';
    const surgeryData = surgeryPrices[selectedSurgeryKey] || surgeryPrices['cesarea-programada'];
    
    // Precio base por especie
    const basePrice = currentSpecies === 'dog' ? surgeryData.dog : surgeryData.cat;

    // Ajuste por peso
    let weightAdjustment = 0;
    const selectedWeight = document.querySelector('input[name="calc-weight"]:checked');
    if (selectedWeight && weightMultipliers[selectedWeight.value] !== undefined) {
      weightAdjustment = weightMultipliers[selectedWeight.value];
    }

    // Costo de exámenes seleccionados
    let examsTotal = 0;
    const selectedExamsNames = [];
    examCheckboxes.forEach(cb => {
      if (cb.checked) {
        examsTotal += parseFloat(cb.value) || 0;
        selectedExamsNames.push(cb.dataset.name || 'Examen');
      }
    });

    const grandTotal = basePrice + weightAdjustment + examsTotal;

    // Actualizar UI
    if (summarySurgeryNameEl) summarySurgeryNameEl.textContent = surgeryData.name;
    if (surgeryBasePriceEl) surgeryBasePriceEl.textContent = `$${basePrice}`;
    if (weightAdjPriceEl) weightAdjPriceEl.textContent = `$${weightAdjustment}`;
    if (examsPriceEl) examsPriceEl.textContent = `$${examsTotal}`;
    if (totalAmountEl) totalAmountEl.textContent = `$${grandTotal}`;

    // Construir mensaje de WhatsApp
    const speciesLabel = currentSpecies === 'dog' ? 'Canino (Perro)' : 'Felino (Gato)';
    const weightLabel = selectedWeight ? selectedWeight.parentElement.textContent.trim() : 'Estándar';
    const examsText = selectedExamsNames.length > 0 ? selectedExamsNames.join(', ') : 'Ninguno añadido';

    const whatsappMessage = encodeURIComponent(
      `Hola SURGIVET Caracas, estuve revisando su calculadora quirúrgica web y deseo coordinar una valoración:\n\n` +
      `🐾 Paciente: ${speciesLabel}\n` +
      `⚖️ Rango de Peso: ${weightLabel}\n` +
      `🩺 Procedimiento: ${surgeryData.name}\n` +
      `🔬 Exámenes Pre-quirúrgicos: ${examsText}\n` +
      `💵 Estimado Web: $${grandTotal} USD\n\n` +
      `Por favor indíquenme disponibilidad de quirófano o cómo proceder con la valoración médica.`
    );

    if (whatsappQuoteBtn) {
      whatsappQuoteBtn.href = `https://wa.me/584127874483?text=${whatsappMessage}`;
    }
  }

  // Ejecución inicial
  calculateEstimate();
}

/* ==========================================================================
   2. TABS INTERACTIVAS DE GUÍA PRE Y POST OPERATORIA
   ========================================================================== */
function initCareGuideTabs() {
  const tabBtns = document.querySelectorAll('.care-tab-btn');
  const tabPanels = document.querySelectorAll('.care-tab-content');

  tabBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      const targetId = btn.dataset.tab;

      tabBtns.forEach(b => b.classList.remove('active'));
      tabPanels.forEach(p => p.classList.remove('active'));

      btn.classList.add('active');
      const activePanel = document.getElementById(targetId);
      if (activePanel) {
        activePanel.classList.add('active');
      }
    });
  });
}

/* ==========================================================================
   3. ACORDEÓN DE PREGUNTAS FRECUENTES (FAQ)
   ========================================================================== */
function initFaqAccordion() {
  const faqItems = document.querySelectorAll('.faq-item');

  faqItems.forEach(item => {
    const button = item.querySelector('.faq-button');
    if (!button) return;

    button.addEventListener('click', () => {
      const isActive = item.classList.contains('active');

      // Cerrar otros
      faqItems.forEach(otherItem => {
        otherItem.classList.remove('active');
        const otherBtn = otherItem.querySelector('.faq-button');
        if (otherBtn) otherBtn.setAttribute('aria-expanded', 'false');
      });

      // Si no estaba activo, abrirlo
      if (!isActive) {
        item.classList.add('active');
        button.setAttribute('aria-expanded', 'true');
      }
    });
  });
}

/* ==========================================================================
   4. CONTROL DE MODALES (AGENDAR VALORACIÓN Y CONTACTO)
   ========================================================================== */
function initModalHandling() {
  const openModalBtns = document.querySelectorAll('[data-open-modal]');
  const closeModalBtns = document.querySelectorAll('[data-close-modal]');
  const modalOverlay = document.getElementById('booking-modal');
  const appointmentForm = document.getElementById('appointment-form');

  openModalBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
      e.preventDefault();
      if (modalOverlay) {
        modalOverlay.classList.add('open');
        document.body.style.overflow = 'hidden';
      }
    });
  });

  closeModalBtns.forEach(btn => {
    btn.addEventListener('click', closeModal);
  });

  if (modalOverlay) {
    modalOverlay.addEventListener('click', (e) => {
      if (e.target === modalOverlay) closeModal();
    });
  }

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && modalOverlay && modalOverlay.classList.contains('open')) {
      closeModal();
    }
  });

  function closeModal() {
    if (modalOverlay) {
      modalOverlay.classList.remove('open');
      document.body.style.overflow = '';
    }
  }

  // Envío del formulario de reserva por WhatsApp
  if (appointmentForm) {
    appointmentForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const petName = document.getElementById('modal-pet-name')?.value || 'Mi Mascota';
      const petType = document.getElementById('modal-pet-type')?.value || 'Perro';
      const surgeryType = document.getElementById('modal-surgery-type')?.value || 'Cesárea / Cirugía';
      const ownerName = document.getElementById('modal-owner-name')?.value || 'Propietario';
      const notes = document.getElementById('modal-notes')?.value || 'Sin observaciones adicionales';

      const message = encodeURIComponent(
        `🚨 SOLICITUD DE VALORACIÓN QUIRÚRGICA - SURGIVET\n\n` +
        `👤 Propietario: ${ownerName}\n` +
        `🐾 Mascota: ${petName} (${petType})\n` +
        `🩺 Procedimiento de Interés: ${surgeryType}\n` +
        `📝 Notas/Síntomas: ${notes}\n\n` +
        `Solicito agendar la evaluación médica pre-quirúrgica a la brevedad.`
      );

      closeModal();
      window.open(`https://wa.me/584127874483?text=${message}`, '_blank');
    });
  }
}

/* ==========================================================================
   5. MENÚ MÓVIL
   ========================================================================== */
function initMobileNav() {
  const toggleBtn = document.querySelector('.mobile-nav-toggle');
  const navMenu = document.querySelector('.main-navigation');

  if (toggleBtn && navMenu) {
    toggleBtn.addEventListener('click', () => {
      navMenu.classList.toggle('mobile-open');
    });

    // Cerrar al clickear cualquier link
    const navLinks = navMenu.querySelectorAll('a');
    navLinks.forEach(link => {
      link.addEventListener('click', () => {
        navMenu.classList.remove('mobile-open');
      });
    });
  }
}
