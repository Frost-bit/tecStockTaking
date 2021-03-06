/*
 * Licensed to the Apache Software Foundation (ASF) under one
 * or more contributor license agreements.  See the NOTICE file
 * distributed with this work for additional information
 * regarding copyright ownership.  The ASF licenses this file
 * to you under the Apache License, Version 2.0 (the
 * "License"); you may not use this file except in compliance
 * with the License.  You may obtain a copy of the License at
 *
 * http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing,
 * software distributed under the License is distributed on an
 * "AS IS" BASIS, WITHOUT WARRANTIES OR CONDITIONS OF ANY
 * KIND, either express or implied.  See the License for the
 * specific language governing permissions and limitations
 * under the License.
 */
var app = {
    // Application Constructor
    initialize: function() {
        this.bindEvents();
        console.log("Starting NFC Reader app");
    },

    // deviceready Event Handler
    //
    // Bind any cordova events here. Common events are:
    // 'pause', 'resume', etc.
    bindEvents: function() {
        document.addEventListener('deviceready', this.onDeviceReady, false);
    },

    onDeviceReady: function(){
            nfc.addTagDiscoveredListener(
            app.onNfc,  //tag successfully scanned
            function(status){
                app.display("Tap a tag to read its id number.");
            },
            function(error){
                app.display("NFC reader failed to initialize " + JSON.stringify(error));
            }
            );
            nfc.addNdefFormatableListener(
                app.onNonNdef,
                function (status) {
                    // listener successfully initialized
                    app.display("Listening for NDEF Formatable tags.");
                },
                function (error) {
                    // listener fails to initialize
                    app.display("NFC reader failed to initialize "
                    + JSON.stringify(error));
                }
            );

            nfc.addNdefListener(
                app.onNfc,
                // tag successfully scanned
                function (status) {
                // listener successfully initialized
                app.display("Listening for NDEF messages.");
                },
                function (error) {
                // listener fails to initialize
                app.display("NFC reader failed to initialize "
                + JSON.stringify(error));
                }
            );

            nfc.addMimeTypeListener(
                "text/plain",
                app.onNfc,
                // tag successfully scanned
                function (status) {
                // listener successfully initialized
                app.display("Listening for plain text MIME Types.");
                },
                function (error) {
                // listener fails to initialize
                app.display("NFC reader failed to initialize "
                + JSON.stringify(error));
                }
            );
            app.display("Tap a tag to read data.");


    },

    /*
    Process NDEF tag data from the nfcEvent
    */
    onNfc: function(nfcEvent) {
        app.clear();
        // clear the message div
        // display the event type:
        app.display(" Event Type: " + nfcEvent.type);
        app.showTag(nfcEvent.tag);
        // display the tag details
    },
        /*
        Process non-NDEF tag data from the nfcEvent
        This includes
        * Non NDEF NFC Tags
        * NDEF-Formatable Tags
        * Mifare Classic Tags on Nexus 4, Samsung S4
        (because Broadcom doesn't support Mifare Classic)
        */
    
    onNonNdef: function(nfcEvent) {
        app.clear();
        // clear the message div
        // display the event type:
        app.display("Event Type: " + nfcEvent.type);
        var tag = nfcEvent.tag;
        app.display("Tag ID: " + nfc.bytesToHexString(tag.id));
        app.display("Tech Types: ");
        for (var i = 0; i < tag.techTypes.length; i++) {
        app.display(" * " + tag.techTypes[i]);
        }
    },
    /*
    writes @tag to the message div:
    */
    showTag: function(tag) {
    // display the tag properties:
    app.display("Tag ID: " + nfc.bytesToHexString(tag.id));
    app.display("Tag Type: " + tag.type);
    app.display("Max Size: " + tag.maxSize + " bytes");
    app.display("Is Writable: " + tag.isWritable);
    app.display("Can Make Read Only: " + tag.canMakeReadOnly);


        // if there is an NDEF message on the tag, display it:
    var thisMessage = tag.ndefMessage;
    if (thisMessage !== null) {
        // get and display the NDEF record count:
        app.display("Tag has NDEF message with " + thisMessage.length
        + " record" + (thisMessage.length === 1 ? ".":"s."));
        app.display("Message Contents: ");
        app.showMessage(thisMessage);
    }


    },


    /*
    iterates over the records in an NDEF message to display them:
    */
    showMessage: function(message) {
        for (var thisRecord in message) {
        // get the next record in the message array:
        var record = message[thisRecord];
        app.showRecord(record);
        // show it
        }
        },
    /*
    writes @record to the message div:
    */
    showRecord: function(record) {
    // display the TNF, Type, and ID:
        app.display(" ");
        app.display("TNF: " + record.tnf);
        app.display("Type: " + nfc.bytesToString(record.type));
        app.display("ID: " + nfc.bytesToString(record.id));
        // if the payload is a Smart Poster, it's an NDEF message.
        // read it and display it (recursion is your friend here):
        if (nfc.bytesToString(record.type) === "Sp") {
            var ndefMessage = ndef.decodeMessage(record.payload);
            app.showMessage(ndefMessage);
        // if the payload's not a Smart Poster, display it:
        } else {
        app.display("Payload: " + nfc.bytesToString(record.payload));
        }
    },


    display: function(message){
        var label = document.createTextNode(message),
        linebreak = document.createElement("br");
        messageDiv.appendChild(linebreak);
        messageDiv.appendChild(label);

    },

    clear: function(){
        messageDiv.innerHTML = "";
    }

    
};

