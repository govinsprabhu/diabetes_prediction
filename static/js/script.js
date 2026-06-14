document.addEventListener('DOMContentLoaded', () => {
    // Initial animations
    gsap.from('.card-header', { y: -20, opacity: 0, duration: 0.8, ease: 'power3.out' });
    gsap.from('.form-grid', { y: 20, opacity: 0, duration: 0.8, delay: 0.2, ease: 'power3.out' });
    gsap.from('.btn-primary', { scale: 0.9, opacity: 0, duration: 0.6, delay: 0.4, ease: 'back.out(1.7)' });

    const form = document.getElementById('prediction-form');
    const submitBtn = document.getElementById('submit-btn');
    const resultContainer = document.getElementById('result-container');
    const resultTitle = document.getElementById('result-title');
    const resultText = document.getElementById('result-probability');
    const resultIcon = document.getElementById('result-icon');
    const resetBtn = document.getElementById('reset-btn');

    form.addEventListener('submit', async (e) => {
        e.preventDefault();
        
        // UI Loading State
        submitBtn.classList.add('loading');
        gsap.to('.btn-text', { opacity: 0, duration: 0.2 });
        gsap.to('.spinner', { opacity: 1, duration: 0.2 });

        // Gather Data
        const formData = new FormData(form);
        const dataPayload = {};
        for (let [key, value] of formData.entries()) {
            dataPayload[key] = parseFloat(value);
        }

        try {
            // Simulated network delay for smooth UX
            await new Promise(resolve => setTimeout(resolve, 800));

            const response = await fetch('/predict', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(dataPayload)
            });

            if (!response.ok) throw new Error('Network response was not ok');

            const result = await response.json();
            
            showResult(result);

        } catch (error) {
            console.error('Error:', error);
            showResult({ error: true, message: 'An error occurred during analysis.' });
        } finally {
            submitBtn.classList.remove('loading');
            gsap.to('.btn-text', { opacity: 1, duration: 0.2 });
            gsap.to('.spinner', { opacity: 0, duration: 0.2 });
        }
    });

    resetBtn.addEventListener('click', () => {
        gsap.to(resultContainer, { 
            opacity: 0, 
            y: 20, 
            duration: 0.4, 
            ease: 'power2.in',
            onComplete: () => {
                resultContainer.classList.add('hidden');
                form.reset();
                form.style.display = 'block';
                gsap.fromTo(form, {opacity: 0, y: 20}, {opacity: 1, y: 0, duration: 0.5});
            }
        });
    });

    function showResult(result) {
        // Hide form, show result
        gsap.to(form, { 
            opacity: 0, 
            duration: 0.3, 
            onComplete: () => {
                form.style.display = 'none';
                resultContainer.classList.remove('hidden');
                
                if (result.error) {
                    resultIcon.innerHTML = '⚠️';
                    resultIcon.className = 'result-icon warning';
                    resultTitle.textContent = 'Analysis Failed';
                    resultTitle.style.color = 'var(--text-light)';
                    resultText.textContent = result.message;
                } else if (result.prediction === 1) {
                    resultIcon.innerHTML = '⚠️'; // Danger icon
                    resultIcon.className = 'result-icon danger';
                    resultTitle.textContent = 'High Risk Detected';
                    resultTitle.style.color = 'var(--danger)';
                    resultText.innerHTML = `Based on the provided metrics, our model indicates a <strong style='color:var(--danger)'>Positive</strong> indication for Diabetes risk. Please consult a healthcare professional.`;
                } else {
                    resultIcon.innerHTML = '✓'; // Success icon
                    resultIcon.className = 'result-icon safe';
                    resultTitle.textContent = 'Low Risk Assessed';
                    resultTitle.style.color = 'var(--primary)';
                    resultText.innerHTML = `Based on the provided metrics, our model indicates a <strong style='color:var(--primary)'>Negative</strong> indication for Diabetes.`;
                }

                // Animate result entry
                gsap.fromTo(resultContainer, 
                    { opacity: 0, y: 20, scale: 0.95 },
                    { opacity: 1, y: 0, scale: 1, duration: 0.6, ease: 'back.out(1.2)' }
                );
            }
        });
    }
});
