const alphabet = 'abcdefghijklmnopqrstuvwxyz'.split('');

function initialize() {
    let tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    let tooltipList = tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl)
    });


    let itemEltList = document.querySelectorAll('.btn,.item')
    itemEltList.forEach(function (itemElt) {
        itemElt.ondragstart = function (e) {
            e.currentTarget.classList.add("btn-warning");
            e.dataTransfer.setData("text/plain", e.target.id);
        };
        itemElt.ondragend = function (e) {
            e.currentTarget.classList.remove("btn-warning");
        };
    });

    let dropZoneEltList = document.querySelectorAll('.drop-zone');
    dropZoneEltList.forEach(function (dropZoneElt) {
        addDropzoneEventListener(dropZoneElt);
    });
}
initialize();

function createItemListElt(name, imgElt) {
    let itemListElt = document.createElement('li');
    itemListElt.classList.add('list-group-item', 'd-flex', 'align-items-center', 'w-100');

    let imgEltClone = imgElt.cloneNode(true);
    imgEltClone.classList.add('p-1');
    itemListElt.appendChild(imgEltClone);

    let textElt = document.createElement('span');
    textElt.classList.add('flex-grow-1');
    textElt.textContent = name;
    itemListElt.appendChild(textElt);

    let inputGroupElt = document.createElement('div');
    inputGroupElt.classList.add('input-group', 'input-group-sm', 'w-25');
    let inputElt = document.createElement('input');
    inputElt.classList.add('form-control', 'text-center', 'px-1');
    inputElt.placeholder = 'Qty';
    inputElt.ariaLabel = 'Quantity of crates';
    inputElt.type = 'number';
    inputElt.min = inputElt.value = 0;
    inputElt.onchange = function (event) {
        let qty = parseInt(inputElt.value);
        if (isNaN(qty) || qty < inputElt.min) {
            qty = inputElt.min;
        }
        inputElt.value = qty;
        if (qty > 1 && buttonMinusElt.disabled) {
            buttonMinusElt.disabled = false;
        }
        onQtyInputChange(event);
    };
    let buttonMinusElt = document.createElement('button');
    buttonMinusElt.classList.add('btn', 'btn-secondary');
    buttonMinusElt.type = 'minus';
    buttonMinusElt.textContent = '-';
    buttonMinusElt.disabled = true;
    buttonMinusElt.onclick = function (event) {
        if (!isNaN(inputElt.value) || inputElt.value > inputElt.min) {
            let incrementStep = 1;
            if (event.shiftKey) {
                incrementStep = 10;
            } else if (event.ctrlKey) {
                incrementStep = 5;
            }
            inputElt.value = (parseInt(inputElt.value) - incrementStep) > 0 ? (parseInt(inputElt.value) - incrementStep) : 0;
        } else {
            inputElt.value = inputElt.min;
        }
        if (inputElt.value === 0 || inputElt.value === '0') {
            this.disabled = true;
        }
        onQtyInputChange(event);
    };
    let buttonPlusElt = document.createElement('button');
    buttonPlusElt.classList.add('btn', 'btn-secondary');
    buttonPlusElt.type = 'plus';
    buttonPlusElt.textContent = '+';
    buttonPlusElt.onclick = function (event) {
        let incrementStep = 1;
        if (event.shiftKey) {
            incrementStep = 10;
        } else if (event.ctrlKey) {
            incrementStep = 5;
        }
        if (!isNaN(inputElt.value)) {
            inputElt.value = parseInt(inputElt.value) + incrementStep;
        } else {
            inputElt.value = 1;
        }

        if (buttonMinusElt.disabled) {
            buttonMinusElt.disabled = false;
        }
        onQtyInputChange(event);
    };
    inputGroupElt.appendChild(buttonMinusElt);
    inputGroupElt.appendChild(inputElt);
    inputGroupElt.appendChild(buttonPlusElt);
    itemListElt.appendChild(inputGroupElt);


    let removeButton = document.createElement('button');
    removeButton.classList.add('btn', 'btn-danger', 'btn-sm', 'ms-3');
    removeButton.textContent = 'X';
    removeButton.onclick = function (event) {
        const itemName = event.target.closest('li').querySelector('img').getAttribute('alt');
        const shipmentElt = event.target.closest('.shipment');

        this.parentNode.parentNode.removeChild(this.parentNode);

        updateItemTotal(itemName);
        updateShipmentTotal(shipmentElt);
    };
    itemListElt.appendChild(removeButton);

    return itemListElt;
}

function addDropzoneEventListener(dropZoneElt) {
    dropZoneElt.ondragover = function () {
        this.classList.add('drop');
        return false;
    }
    dropZoneElt.ondragleave = function () {
        this.classList.remove('drop');
        return false;
    }
    dropZoneElt.ondrop = function (e) {
        e.preventDefault();
        this.classList.remove('drop');
        let draggedItem = document.getElementById(e.dataTransfer.getData("text/plain"));
        let itemList = createItemListElt(draggedItem.dataset.bsOriginalTitle, draggedItem.querySelector('img'));
        // let itemCategory = draggedItem.parentNode.getAttribute("aria-labelledby").split("-")[2];
        let shipmentElt = e.currentTarget.closest('.shipment');
        shipmentElt.querySelector('ul').appendChild(itemList);
        updateItemTotal(draggedItem.querySelector('img').getAttribute('alt'));
        updateShipmentTotal(shipmentElt);
    }
}

function addShipment(event) {
    let shipmentListElt = document.querySelector('#shipment-list');
    let shipmentCloneElt = shipmentListElt.children[0].cloneNode(true);
    addDropzoneEventListener(shipmentCloneElt.querySelector('.drop-zone'));
    shipmentCloneElt.querySelector('h5').textContent = alphabet[shipmentListElt.children.length - 1].toUpperCase();
    shipmentCloneElt.querySelector('ul').innerHTML = '';
    shipmentCloneElt.querySelector('.crate-amount').textContent = '0';
    shipmentListElt.insertBefore(shipmentCloneElt, event.target);
}

onQtyInputChange = function (event) {
    const itemName = event.target.closest('li').querySelector('img').getAttribute('alt');
    updateItemTotal(itemName);
    updateShipmentTotal(event.currentTarget.closest('.shipment'));
};

updateItemTotal = function (itemName) {
    let itemEltList = document.querySelectorAll('.list-group-item>img[alt="' + itemName + '"]');
    let total = 0;
    itemEltList.forEach(function (itemElt) {
        let qty = parseInt(itemElt.parentNode.querySelector('input').value);
        if (isNaN(qty)) {
            qty = 1;
            itemElt.parentNode.querySelector('input').value = qty;
        }
        total += qty;
    });
    document.querySelector('#item_' + itemName).querySelector('.amount').textContent = total > 0 ? total : '';
}


function updateShipmentTotal(shipmentElement) {
    let shipmentTotal = 0;
    let shipmentItemList = shipmentElement.querySelector('ul').children;
    for (let i = 0; i < shipmentItemList.length; i++) {
        let crateQuantity = parseInt(shipmentItemList[i].querySelector('input').value);
        shipmentTotal += isNaN(crateQuantity) ? 0 : crateQuantity;
    }
    shipmentElement.querySelector('.crate-amount').textContent = shipmentTotal;
}

async function generate_list(event){
    const textarea = document.querySelector('#generated_list');
    textarea.textContent = '#**Todo list**\n';
    textarea.disabled = true;
    let shipmentList = document.querySelectorAll('.shipment');
    let itemList = [];
    for (let i = 0; i < shipmentList.length; i++) {
        let shipmentItemList = shipmentList[i].querySelector('ul').children;
        const shipmentName = shipmentList[i].querySelector('h5').textContent;
        for (let j = 0; j < shipmentItemList.length; j++) {
            let crateQuantity = parseInt(shipmentItemList[j].querySelector('input').value);
            if (isNaN(crateQuantity)) {
                crateQuantity = 0;
            }
            let itemName = shipmentItemList[j].querySelector('span').textContent;
            let row = j === 0 ? shipmentName : " ";
            row += "・" + itemName + "・" + (crateQuantity <= 1 ? crateQuantity + " crate" : crateQuantity + " crates");
            textarea.textContent += row + "\n";
        }
    }
    textarea.disabled = false;  
}

function copyToClipboard(event){
    const list = event.target.parentNode.parentNode.querySelector('textarea').value.trim()
    navigator.clipboard.writeText(list);
}