// predict.js - Wine Quality Prediction Controller

// Sample wine data for quick testing
const sampleWines = {
    highQualityRed: {
        fixed_acidity: 7.9,
        volatile_acidity: 0.35,
        citric_acid: 0.46,
        residual_sugar: 3.6,
        chlorides: 0.078,
        free_sulfur_dioxide: 15,
        total_sulfur_dioxide: 37,
        density: 0.9973,
        pH: 3.35,
        sulphates: 0.86,
        alcohol: 12.8
    },
    mediumQualityWhite: {
        fixed_acidity: 7.0,
        volatile_acidity: 0.27,
        citric_acid: 0.36,
        residual_sugar: 20.7,
        chlorides: 0.045,
        free_sulfur_dioxide: 45,
        total_sulfur_dioxide: 170,
        density: 1.001,
        pH: 3.0,
        sulphates: 0.45,
        alcohol: 8.8
    }
};

// Function to fetch and insert HTML components
async function loadComponent(url, containerId) {
    try {
        const response = await fetch(url);
        if (response.ok) {
            const html = await response.text();
            document.getElementById(containerId).innerHTML = html;
            
            // After loading the form, add event listeners
            if (containerId === 'predict-form-container') {
                setupFormHandlers();
            }
            if (containerId === 'display-result-container') {
                setupResultHandlers();
            }
        } else {
            console.error(`Failed to load component from ${url}`);
        }
    } catch (error) {
        console.error(`Error loading component from ${url}:`, error);
    }
}

// Function to set up form handlers
function setupFormHandlers() {
    const form = document.getElementById('wine-predict-form');
    if (form) {
        form.addEventListener('submit', handleFormSubmit);
    }
    
    // Sample wine buttons
    const highQualitySampleBtn = document.getElementById('high-quality-sample');
    if (highQualitySampleBtn) {
        highQualitySampleBtn.addEventListener('click', () => fillSampleData('highQualityRed'));
    }
    
    const mediumQualitySampleBtn = document.getElementById('medium-quality-sample');
    if (mediumQualitySampleBtn) {
        mediumQualitySampleBtn.addEventListener('click', () => fillSampleData('mediumQualityWhite'));
    }
}

// Function to set up result handlers
function setupResultHandlers() {
    const newPredictionBtn = document.getElementById('new-prediction');
    if (newPredictionBtn) {
        newPredictionBtn.addEventListener('click', () => {
            document.getElementById('result-section').classList.remove('active');
            window.scrollTo({ top: 0, behavior: 'smooth' });
        });
    }
    
    const downloadReportBtn = document.getElementById('download-report');
    if (downloadReportBtn) {
        downloadReportBtn.addEventListener('click', handleDownloadReport);
    }
}

// Function to fill form with sample data
function fillSampleData(sampleType) {
    const sample = sampleWines[sampleType];
    
    document.getElementById('fixed_acidity').value = sample.fixed_acidity;
    document.getElementById('volatile_acidity').value = sample.volatile_acidity;
    document.getElementById('citric_acid').value = sample.citric_acid;
    document.getElementById('residual_sugar').value = sample.residual_sugar;
    document.getElementById('chlorides').value = sample.chlorides;
    document.getElementById('free_sulfur_dioxide').value = sample.free_sulfur_dioxide;
    document.getElementById('total_sulfur_dioxide').value = sample.total_sulfur_dioxide;
    document.getElementById('density').value = sample.density;
    document.getElementById('pH').value = sample.pH;
    document.getElementById('sulphates').value = sample.sulphates;
    document.getElementById('alcohol').value = sample.alcohol;
}

// Function to handle form submission
function handleFormSubmit(event) {
    event.preventDefault();
    
    // Show loading indicator
    const loadingIndicator = document.getElementById('loading-indicator');
    if (loadingIndicator) {
        loadingIndicator.classList.add('active');
    }
    
    // Collect form data
    const formData = new FormData(event.target);
    const formObject = {};
    
    for (const [key, value] of formData.entries()) {
        formObject[key] = parseFloat(value);
    }
    
    // Call API to get prediction
    predictWineQuality(formObject);
}

// Function to call the backend API for prediction
async function predictWineQuality(data) {
    try {
        const response = await fetch('/api/predict', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify(data)
        });
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
        }
        
        if (!response.ok) {
            throw new Error(`HTTP error! Status: ${response.status}`);
        }
        
        const result = await response.json();
        displayResults(data, result);
        
    } catch (error) {
        console.error('Error predicting wine quality:', error);
        
        // Hide loading indicator
        const loadingIndicator = document.getElementById('loading-indicator');
        if (loadingIndicator) {
            loadingIndicator.classList.remove('active');
        }
        
        // Show error message
        alert('Error predicting wine quality. Please try again later.');
    }
}

// Function to display results
function displayResults(inputData, predictionResult) {
    // Set current date
    const today = new Date();
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    document.getElementById('result-date').textContent = today.toLocaleDateString('en-US', options);
    
    // Get prediction and quality score (assuming classes are numeric and sorted)
    const prediction = predictionResult.prediction;
    document.getElementById('quality-score').textContent = prediction;
    
    // Update the gauge (convert quality scale to percentage)
    // Assuming quality scale is 1-10
    const minQuality = Math.min(...predictionResult.class_labels);
    const maxQuality = Math.max(...predictionResult.class_labels);
    const range = maxQuality - minQuality;
    const gaugePercentage = ((prediction - minQuality) / range) * 100;
    
    const gauge = document.getElementById('quality-gauge');
    gauge.style.width = `${gaugePercentage}%`;
    
    // Update quality level text
    const qualityLevel = document.getElementById('quality-level');
    if (prediction <= 4) {
        qualityLevel.textContent = "Poor";
        qualityLevel.className = "low";
    } else if (prediction <= 6) {
        qualityLevel.textContent = "Average";
        qualityLevel.className = "moderate";
    } else {
        qualityLevel.textContent = "Excellent";
        qualityLevel.className = "high";
    }
    
    // Update key factors
    document.getElementById('factor-fixed-acidity').textContent = inputData.fixed_acidity.toFixed(1);
    document.getElementById('factor-volatile-acidity').textContent = inputData.volatile_acidity.toFixed(3);
    document.getElementById('factor-ph').textContent = inputData.pH.toFixed(2);
    document.getElementById('factor-alcohol').textContent = inputData.alcohol.toFixed(1) + '%';
    document.getElementById('factor-sugar').textContent = inputData.residual_sugar.toFixed(1) + ' g/L';
    document.getElementById('factor-sulfates').textContent = inputData.sulphates.toFixed(2) + ' g/L';
    
    // Generate wine analysis based on prediction
    let analysisText = '';
    if (prediction <= 4) {
        analysisText = `This wine shows opportunities for improvement. The ${getKeyDeficiency(inputData)} may contribute to the lower quality score. Consider adjustments to improve balance and overall quality.`;
    } else if (prediction <= 6) {
        analysisText = `This wine exhibits a relatively balanced profile with moderate characteristics. The ${getKeyStrength(inputData)} is a positive attribute, though improvements could be made in ${getKeyWeakness(inputData)}.`;
    } else {
        analysisText = `This wine shows excellent quality with well-balanced components. The combination of ${getKeyStrength(inputData)} and ${getSecondaryStrength(inputData)} creates a harmonious profile that should be highly enjoyable.`;
    }
    
    // Update wine analysis
    document.getElementById('wine-analysis').textContent = analysisText;
    
    // Update feature importance if available
    if (predictionResult.feature_importance && Object.keys(predictionResult.feature_importance).length > 0) {
        renderFeatureImportance(predictionResult.feature_importance);
    }
    
    // Show the result section
    document.getElementById('result-section').classList.add('active');
    
    // Scroll to results
    document.getElementById('result-section').scrollIntoView({ behavior: 'smooth' });
}

// Function to render feature importance chart
function renderFeatureImportance(featureImportance) {
    const chartContainer = document.getElementById('feature-importance-chart');
    chartContainer.innerHTML = '';
    
    // Sort features by importance
    const sortedFeatures = Object.entries(featureImportance)
        .sort((a, b) => b[1] - a[1])
        .slice(0, 6); // Show top 6 features
    
    // Create bars for each feature
    sortedFeatures.forEach(([feature, importance]) => {
        const percentage = (importance * 100).toFixed(1);
        const featureLabel = formatFeatureName(feature);
        
        const barContainer = document.createElement('div');
        barContainer.className = 'importance-bar-container';
        
        const labelElement = document.createElement('div');
        labelElement.className = 'importance-label';
        labelElement.textContent = featureLabel;
        
        const barWrapper = document.createElement('div');
        barWrapper.className = 'importance-bar-wrapper';
        
        const barElement = document.createElement('div');
        barElement.className = 'importance-bar';
        barElement.style.width = `${percentage}%`;
        
        const valueElement = document.createElement('div');
        valueElement.className = 'importance-value';
        valueElement.textContent = `${percentage}%`;
        
        barWrapper.appendChild(barElement);
        barWrapper.appendChild(valueElement);
        
        barContainer.appendChild(labelElement);
        barContainer.appendChild(barWrapper);
        
        chartContainer.appendChild(barContainer);
    });
}

// Format feature name for display
function formatFeatureName(feature) {
    return feature
        .split(' ')
        .map(word => word.charAt(0).toUpperCase() + word.slice(1))
        .join(' ');
}

// Helper functions for generating wine analysis text
function getKeyDeficiency(data) {
    if (data.volatile_acidity > 0.7) {
        return "high volatile acidity";
    } else if (data.alcohol < 9.5) {
        return "low alcohol content";
    } else if (data.pH > 3.8) {
        return "high pH level";
    } else if (data.sulphates < 0.4) {
        return "low sulfate content";
    } else {
        return "unbalanced acid profile";
    }
}

function getKeyStrength(data) {
    if (data.alcohol > 11.5) {
        return "high alcohol content";
    } else if (data.volatile_acidity < 0.3) {
        return "well-controlled volatile acidity";
    } else if (data.sulphates > 0.7) {
        return "optimal sulfate levels";
    } else if (data.pH >= 3.2 && data.pH <= 3.4) {
        return "balanced pH";
    } else {
        return "good acid structure";
    }
}

function getKeyWeakness(data) {
    if (data.volatile_acidity > 0.5) {
        return "volatile acidity control";
    } else if (data.alcohol < 10) {
        return "alcohol content";
    } else if (data.pH > 3.6 || data.pH < 3.1) {
        return "pH balance";
    } else if (data.sulphates < 0.5) {
        return "sulfate levels";
    } else {
        return "overall balance";
    }
}

function getSecondaryStrength(data) {
    if (data.alcohol > 11.5) {
        if (data.volatile_acidity < 0.3) {
            return "excellent acidity control";
        } else if (data.pH >= 3.2 && data.pH <= 3.4) {
            return "ideal pH level";
        } else {
            return "good structural components";
        }
    } else if (data.volatile_acidity < 0.3) {
        if (data.pH >= 3.2 && data.pH <= 3.4) {
            return "optimal pH balance";
        } else if (data.sulphates > 0.7) {
            return "proper sulfate content";
        } else {
            return "good overall balance";
        }
    } else {
        return "harmonious structural elements";
    }
}

// Function to handle report download
function handleDownloadReport() {
    alert("Report download functionality would be implemented here. This would generate a PDF of the wine quality analysis with detailed information about the prediction.");
}

// Initialize component loading when the page loads
function initPredictPage() {
    loadComponent('/components/Header.html', 'header-container');
    loadComponent('/components/PredictForm.html', 'predict-form-container');
    loadComponent('/components/DisplayResult.html', 'display-result-container');
    loadComponent('/components/Footer.html', 'footer-container');
}

// Export functions for use in other modules if needed
window.predictController = {
    init: initPredictPage,
    loadComponent: loadComponent,
    handleFormSubmit: handleFormSubmit,
    predictWineQuality: predictWineQuality,
    displayResults: displayResults,
    handleDownloadReport: handleDownloadReport
};

// Run initialization when the DOM is fully loaded
document.addEventListener('DOMContentLoaded', initPredictPage);