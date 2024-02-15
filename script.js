document.addEventListener('DOMContentLoaded', function() {
    const accountsContainer = document.getElementById('accountsContainer');
    const addAccountBtn = document.getElementById('addAccountBtn');
    const downloadInvoiceBtn = document.getElementById('downloadInvoiceBtn');
    const trxidInputContainer = document.getElementById('trxidInputContainer');
    const submitTrxidBtn = document.getElementById('submitTrxidBtn');
    const trxidInput = document.getElementById('trxidInput');

    const officialDiscounts = {
        smallAccount: 0, // 5% discount for small accounts
        bigAccount: 0 // 10% discount for big accounts
    };

    let accountCount = 0;
    // Define actual prices for addons
    const addonPrices = {
        'lifeTimePayout': 300, // Example price for 95% Life Time Payout
        'noMinimumDays': 200, // Example price for No Minimum Trading Days
        'refund': 500, // Example price for 150% Refund
        '125Refund': 400 // Example price for 125% Refund
    };

    // Segmented pricing configuration
    const pricingConfig = {
        'stellar': {
            'swap': {
                '1step': {'6K': 55, '15K': 111, '25K': 187, '50K': 280, '100K': 485, '200K': 935},
                '2step': {'6K': 51, '15K': 102, '25K': 170, '50K': 255, '100K': 442, '200K': 850}
            },
            'swapFree': {
                '1step': {'6K': 62, '15K': 122, '25K': 206, '50K': 309, '100K': 533, '200K': 1029},
                '2step': {'6K': 56, '15K': 112, '25K': 187, '50K': 281, '100K': 486, '200K': 935}
            }
        },
        'express': {
            'swap': {
                'consistency': {'6K': 43, '15K': 85, '25K': 170, '50K': 255, '100K': 468, '200K': 850},
                'nonConsistency': {'6K': 51, '15K': 102, '25K': 196, '50K': 232, '100K': 595}
            },
            'swapFree': {
                'consistency': {'6K': 47, '15K': 94, '25K': 187, '50K': 281, '100K': 513, '200K': 935},
                'nonConsistency': {'6K': 56, '15K': 112, '25K': 215, '50K': 355, '100K': 655}
            }
        },
        'evaluation': {
            'swap': {
                '6K': 43, '15K': 85, '25K': 170, '50K': 255, '100K': 467, '200K': 850
            },
            'swapFree': {
                '6K': 46, '15K': 94, '25K': 187, '50K': 281, '100K': 513, '200K': 934
            }
        }
    };

    function updateStepTypeOptions(stepTypeSelect, challengeType) {
        stepTypeSelect.innerHTML = '';

        if (challengeType === 'stellar') {
            stepTypeSelect.innerHTML = '<option value="1step">1-Step</option><option value="2step">2-Step</option>';
        } else if (challengeType === 'express') {
            stepTypeSelect.innerHTML = '<option value="consistency">Consistency</option><option value="nonConsistency">Non-Consistency</option>';
        } else {
            stepTypeSelect.innerHTML = '<option disabled selected>Select Step Type</option>';
        }
    }

function calculatePriceForAccount(challengeType, swapType, stepType, sizeOfAccount, addons) {
    let basePrice = 0;
    // Determine the base price from the configuration
    if (challengeType === 'evaluation') {
        if (pricingConfig[challengeType] && pricingConfig[challengeType][swapType]) {
            basePrice = pricingConfig[challengeType][swapType][sizeOfAccount] || 0;
        }
    } else {
        if (pricingConfig[challengeType] && pricingConfig[challengeType][swapType] && pricingConfig[challengeType][swapType][stepType]) {
            basePrice = pricingConfig[challengeType][swapType][stepType][sizeOfAccount] || 0;
        }
    }

    // Initial total price starts as the base price
    let totalPrice = basePrice;

    // Calculate addon prices based on the original base price
    addons.forEach(addon => {
        if (addon.checked) {
            let addonIncrease = 0; // Percentage increase
            switch (challengeType) {
                case 'stellar':
                    if (stepType === '1step') {
                        addonIncrease = addon.value === 'lifeTimePayout' ? 0.10 :
                                        addon.value === 'noMinimumDays' ? 0.15 :
                                        addon.value === 'refund' || addon.value === '125Refund' ? 0.10 : 0;
                    } else if (stepType === '2step') {
                        addonIncrease = addon.value === 'lifeTimePayout' ? 0.20 :
                                        addon.value === 'noMinimumDays' ? 0.15 :
                                        addon.value === 'refund' || addon.value === '125Refund' ? 0.10 : 0;
                    }
                    break;
                case 'express':
                    addonIncrease = addon.value === 'lifeTimePayout' ? 0.30 : 0.10; // No "No Minimum Trading Days" for Express
                    break;
                case 'evaluation':
                    addonIncrease = addon.value === 'lifeTimePayout' ? 1.20 :
                                    addon.value === 'noMinimumDays' ? 0.15 :
                                    addon.value === 'refund' || addon.value === '125Refund' ? 0.10 : 0;
                    break;
            }
            // Increase total price by the addon's percentage of the original base price
            totalPrice += basePrice * addonIncrease;
        }
    });

    return totalPrice; // Return the total price after all addon increases
}


    function updateAccountSizeVisibility(accountDiv) {
    const challengeTypeSelect = accountDiv.querySelector('.challengeType');
    const stepTypeSelect = accountDiv.querySelector('.stepType');
    const sizeOfAccountSelect = accountDiv.querySelector('.sizeOfAccount');
    const option200K = sizeOfAccountSelect.querySelector('option[value="200K"]');

    // Logic for hiding/showing No Minimum Trading Days and Refund add-ons
    const noMinimumDaysCheckbox = accountDiv.querySelector('input[name="noMinimumDays"]');
    const refund125Checkbox = accountDiv.querySelector('input[name="125Refund"]');
    const refund150Checkbox = accountDiv.querySelector('input[name="refund"]');

    noMinimumDaysCheckbox.parentElement.style.display = challengeTypeSelect.value === 'express' ? 'none' : 'block';

    refund125Checkbox.onchange = function() {
        if (refund125Checkbox.checked) refund150Checkbox.checked = false;
    };
    refund150Checkbox.onchange = function() {
        if (refund150Checkbox.checked) refund125Checkbox.checked = false;
    };

}

    function updateSelectionSummary() {
    const selectionSummaries = document.getElementById('selectionSummaries');
    selectionSummaries.innerHTML = ''; // Clear previous summaries
    let totalPrice = 0;
    let totalDiscount = 0;

    document.querySelectorAll('.account').forEach((account, index) => {
        const sizeOfAccount = account.querySelector('.sizeOfAccount').value;
        const challengeType = account.querySelector('.challengeType').value;
        const swapType = account.querySelector('.swapType').value;
        const stepType = account.querySelector('.stepType').value;
        const platform = account.querySelector('.platform').value;
        const broker = account.querySelector('.broker').value;
        const addons = account.querySelectorAll('input[type="checkbox"]');
        
        const price = calculatePriceForAccount(challengeType, swapType, stepType, sizeOfAccount, addons);
        totalPrice += price;

        // Apply discount based on account size
        if (['6K', '15K', '25K'].includes(sizeOfAccount)) {
            totalDiscount += price * (officialDiscounts.smallAccount / 100);
        } else if (['50K', '100K', '200K'].includes(sizeOfAccount)) {
            totalDiscount += price * (officialDiscounts.bigAccount / 100);
        }

        const summary = document.createElement('div');
        summary.classList.add('selection-summary');
        summary.innerHTML = `Account ${index + 1}: ${challengeType} + ${swapType} + ${stepType} + ${sizeOfAccount} + ${platform} + ${broker} ` + 
                            (addons.length ? ' + ' + Array.from(addons).filter(addon => addon.checked).map(addon => addon.getAttribute('data-label')).join(' + ') : '') +
                            `<br>Price: $${price.toFixed(2)}`;
        selectionSummaries.appendChild(summary);
    });

    // Calculate the final total price after discount
    let finalTotalPrice = totalPrice - totalDiscount;

    // Update the HTML for Official Discount and Total Price After Discount
    const totalPriceElement = document.getElementById('totalPrice');
    totalPriceElement.innerHTML = `Official Discount: $${totalDiscount.toFixed(2)}<br>Total Price After Discount: $${finalTotalPrice.toFixed(2)}`;
}

   function addAccount() {
    accountCount++;
    const accountDiv = document.createElement('div');
    accountDiv.classList.add('account');
    
    // Create left options container
    const leftOptionsContainer = document.createElement('div');
    leftOptionsContainer.classList.add('left-options');
    leftOptionsContainer.innerHTML = `
        <div class="option-group">
            <label>Name of the Client:</label>
            <input type="text" class="client-name" placeholder="Enter name">
        </div>
        <div class="option-group">
            <label>Email of the Client:</label>
            <input type="email" class="client-email" placeholder="Enter email">
        </div>
        <div class="option-group">
            <label>Country of the Client:</label>
            <input type="text" class="client-country" placeholder="Enter country">
        </div>
        <div class="option-group">
            <label>Challenge Type:</label>
            <select class="challengeType">
                <option value="stellar">Stellar</option>
                <option value="evaluation">Evaluation</option>
                <option value="express">Express</option>
            </select>
        </div>
        <div class="option-group">
            <label>Swap Type:</label>
            <select class="swapType">
                <option value="swap">Swap</option>
                <option value="swapFree">Swap Free</option>
            </select>
        </div>
        <div class="option-group">
            <label>Step Type:</label>
            <select class="stepType"></select>
        </div>
        <div class="option-group">
            <label>Account Size:</label>
            <select class="sizeOfAccount">
                <option value="6K">6K</option>
                <option value="15K">15K</option>
                <option value="25K">25K</option>
                <option value="50K">50K</option>
                <option value="100K">100K</option>
                <option value="200K">200K</option>
            </select>
        </div>
        <div class="option-group">
            <label>Platform:</label>
            <select class="platform">
                <option value="mt4">MT4</option>
                <option value="mt5">MT5</option>
            </select>
        </div>
        <div class="option-group">
            <label>Broker:</label>
            <select class="broker">
                <option value="growthnext">GrowthNext</option>
                <option value="fundednext">Funded</option>
            </select>
        </div>
    `;
    accountDiv.appendChild(leftOptionsContainer);

    // Create right options container for addons
    const rightOptionsContainer = document.createElement('div');
    rightOptionsContainer.classList.add('right-options');
    rightOptionsContainer.innerHTML = `
        <div class="checkbox-group">
            <input type="checkbox" id="lifeTimePayout-${accountCount}" name="lifeTimePayout" value="lifeTimePayout" data-label="95% Life Time Payout">
            <label for="lifeTimePayout-${accountCount}">95% Life Time Payout</label>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="noMinimumDays-${accountCount}" name="noMinimumDays" value="noMinimumDays" data-label="No Minimum Trading Days">
            <label for="noMinimumDays-${accountCount}">No Minimum Trading Days</label>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="125Refund-${accountCount}" name="125Refund" value="125Refund" data-label="125% Refund">
            <label for="125Refund-${accountCount}">125% Refund</label>
        </div>
        <div class="checkbox-group">
            <input type="checkbox" id="refund-${accountCount}" name="refund" value="refund" data-label="150% Refund">
            <label for="refund-${accountCount}">150% Refund</label>
        </div>
    `;
    accountDiv.appendChild(rightOptionsContainer);

    // Add event listeners and update options
    const challengeTypeSelect = accountDiv.querySelector('.challengeType');
    const swapTypeSelect = accountDiv.querySelector('.swapType');
    const stepTypeSelect = accountDiv.querySelector('.stepType');
    const sizeOfAccountSelect = accountDiv.querySelector('.sizeOfAccount');

    challengeTypeSelect.addEventListener('change', function() {
        updateStepTypeOptions(stepTypeSelect, challengeTypeSelect.value);
        updateAccountSizeVisibility(accountDiv);
        updateSelectionSummary();
        const addonCheckboxes = accountDiv.querySelectorAll('input[type="checkbox"]');
        addonCheckboxes.forEach(checkbox => {
            checkbox.checked = false;
        });
    });

    swapTypeSelect.addEventListener('change', function() {
        updateSelectionSummary();
    });

    stepTypeSelect.addEventListener('change', function() {
        updateSelectionSummary();
    });

    sizeOfAccountSelect.addEventListener('change', function() {
        updateSelectionSummary();
    });

    updateStepTypeOptions(stepTypeSelect, challengeTypeSelect.value);
    updateAccountSizeVisibility(accountDiv);

    const addonInputs = accountDiv.querySelectorAll('input[type="checkbox"]');
    addonInputs.forEach(input => {
        input.addEventListener('change', updateSelectionSummary);
    });

    // Add remove button
    if (accountCount > 1) {
        const removeBtn = document.createElement('button');
        removeBtn.textContent = 'Remove This Account';
        removeBtn.classList.add('remove-account-btn');
        removeBtn.onclick = function() {
            accountsContainer.removeChild(accountDiv);
            accountCount--;
            updateSelectionSummary();
        };
        accountDiv.appendChild(removeBtn);
    }

    accountsContainer.appendChild(accountDiv);
    updateSelectionSummary();
}

downloadInvoiceBtn.addEventListener('click', function() {
        trxidInputContainer.style.display = 'block';
    });

    submitTrxidBtn.addEventListener('click', function() {
    const trxid = trxidInput.value.trim();
    if (trxid) {
        generatePDF(trxid);
        // Assuming generatePDF is asynchronous and doesn't block the execution,
        // you might want to set a timeout or wait for a specific event indicating the PDF has been generated.
        // For simplicity, let's just reload the page immediately here.
        setTimeout(() => { window.location.reload(); }, 1000); // Adjust delay as needed
    } else {
        alert('Please complete the payment and submit your TRXID.');
    }
});


function generatePDF(trxid) {
    const { jsPDF } = window.jspdf; // Ensure jsPDF is correctly loaded
    const doc = new jsPDF();

    doc.setFontSize(16);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(128, 0, 128); // Set title color
    doc.text("FundedNext Payment Partner", 105, 20, null, null, 'center'); // Center title

    // Draw title underline
    doc.setDrawColor(128, 0, 128); // Purple line color
    doc.setLineWidth(0.5);
    doc.line(20, 25, 190, 25); // Title underline

    let yPos = 35; // Start position for items listing

    doc.setFontSize(12);
    doc.setFont(undefined, 'normal');
    doc.setTextColor(0, 0, 0);

    // Calculating positions based on percentage
    const itemsWidth = 170 * 0.7; // 70% of the usable width for items
    const itemsPositionX = 20; // Starting X for items (left side)
    const separationLineX = itemsPositionX + itemsWidth; // Position for the separation line
    const priceWidth = 150 * 0.2; // 30% of the usable width for price
    const pricePositionX = separationLineX + (160 * 0.25); // Starting X for price (right side), just after the separation line

    // Draw table headers
    doc.setFont(undefined, 'bold');
    doc.text("ITEMS", itemsPositionX, yPos);
    doc.text("PRICE", pricePositionX, yPos, { align: "right" });

    yPos += 10; // Move to next row

    let accountCount = 0; // Counter to track the number of accounts on each page
    let totalAccounts = document.querySelectorAll('.account').length;

    // Loop through each account to add their details to the PDF
    document.querySelectorAll('.account').forEach((account, index) => {
        const clientName = account.querySelector('.client-name').value;
        const clientEmail = account.querySelector('.client-email').value;
        const clientCountry = account.querySelector('.client-country').value;
        const challengeType = account.querySelector('.challengeType').value;
        const swapType = account.querySelector('.swapType').value;
        const stepType = account.querySelector('.stepType').value;
        const sizeOfAccount = account.querySelector('.sizeOfAccount').value;
        const platform = account.querySelector('.platform').value;
        const broker = account.querySelector('.broker').value;
        const addons = Array.from(account.querySelectorAll('input[type="checkbox"]:checked')).map(addon => addon.getAttribute('data-label')).join(', ');

        // Display client information first.
        yPos += 5;
        doc.setFont(undefined, 'bold'); // Switch to bold font
        doc.setTextColor(128, 0, 128); // Set text color to purple

        // Display "Account" and index with the new style
        doc.text(`Account ${index + 1}:`, itemsPositionX, yPos);

        // Reset yPos, font style, and color for subsequent text
        yPos += 10; // Move to next row
        doc.setFont(undefined, 'normal'); // Switch back to normal font
        doc.setTextColor(0, 0, 0); // Reset text color to black

        // Continue with the rest of the text in normal style
        doc.text(`Client Name: ${clientName}`, itemsPositionX, yPos);
        yPos += 10;
        doc.text(`Email: ${clientEmail}`, itemsPositionX, yPos);
        yPos += 10;
        doc.text(`Country: ${clientCountry}`, itemsPositionX, yPos);
        yPos += 20; // Add a 2-line gap after "Country"

        // Display other account details
        let addonsDisplay;
        let addonsLineGap = '';
        if (addons) {
            const addonList = addons.split(', ');
            if (addonList.length === 1) {
                addonsDisplay = `Add On: ${addons}`;
                addonsLineGap = '\n'; // Add line gap only if addons are selected
            } else {
                addonsDisplay = `AddOns:\n${addonList.join('\n')}`;
                addonsLineGap = '\n'; // Add line gap only if addons are selected
            }
        } else {
            addonsDisplay = '';
            addonsLineGap = ''; // No line gap if no addons are selected
        }

        const accountDetails = [
            `Model: ${challengeType} + ${swapType} + ${stepType} + ${sizeOfAccount}`,
            `Platform & Broker: ${platform} + ${broker}`,
            addonsDisplay,
            addonsLineGap // Include the line gap here
        ];

        accountDetails.forEach(detail => {
            doc.text(detail, itemsPositionX, yPos);
            yPos += 10;
        });

        // Calculate and display the price for this account
        const price = calculatePriceForAccount(challengeType, swapType, stepType, sizeOfAccount, account.querySelectorAll('input[type="checkbox"]'));
        let priceStr = `$${price.toFixed(2)}`;
        doc.text(priceStr, 180, yPos - 5, { align: "right" }); // Ensure price is aligned to the right, within the price section

        yPos += 10; // Move to next row for the next account or final summary

        accountCount++; // Increment the account count for this page

        // If two accounts have been displayed on this page or if this is the last account, start a new page for TRXID, discount, and total price after discount
        if (accountCount === 2 || index === totalAccounts - 1) {
    doc.setDrawColor(128, 0, 128); // Set draw color to purple for the separation line
    doc.setLineWidth(0.5); // Set line width for the separation line

    // Draw separation line
    doc.line(separationLineX, 27, separationLineX, yPos - 10); // Draw separation line on each page

    // Condition for adding a new page based on account count
    if (accountCount === 2) {
        // If we have exactly 2 accounts, we prepare to add a new page for TRXID and discounts
        doc.addPage();
        yPos = 35; // Reset yPos for the new page
    }

    // This block now executes for both when there's 1 account on the last page and after adding a new page for 2 accounts
    // Centering TRXID, discount, and total price after discount
    let centerPositionX = 105; // Assuming A4 size for center alignment

    doc.setFontSize(12);
    doc.setFont(undefined, 'bold');
    doc.setTextColor(128, 0, 128); // Set text color to purple for consistency

    // Reset yPos for spacing if only 1 account on the page or it's a new page for final details
    yPos = accountCount === 2 ? 35 : yPos + 20;

    // Display TRXID, discount, and total price after discount at the center
    doc.text(`TRXID: ${trxid}`, centerPositionX, yPos, null, null, 'center');
    yPos += 10; // Additional space before showing the discount

    // Assuming the logic to get the discount and total price information is correct
    const totalPriceElement = document.getElementById('totalPrice').innerHTML;
    const [officialDiscountText, totalPriceAfterDiscountText] = totalPriceElement.split('<br>').map(text => text.trim());

    doc.setFontSize(14);
    doc.setFont(undefined, 'bold');
    doc.text(officialDiscountText, centerPositionX, yPos, null, null, 'center');
    yPos += 10;
    doc.text(totalPriceAfterDiscountText, centerPositionX, yPos, null, null, 'center');

    // Note: Adjust the `centerPositionX` as needed based on your document's layout and requirements
}

    });

    // Save the PDF document
    doc.save('FundedNext_Invoice.pdf');
}


    addAccountBtn.addEventListener('click', addAccount);
    // Initialize the first account
    addAccount();
});
