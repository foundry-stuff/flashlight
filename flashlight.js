class Flashlight {

	static getButtonRotation() {
		if (!this.buttonRotationIsOnSetting())
			return this.buttonSideSetting() == "left" ? 180 : 0;
		return this.getLightRotation();
	}

	static getLightRotation() {
		let rotationSum = 0, tokenCount = 0;
        canvas.tokens.controlled.forEach((token) => {
	        rotationSum += token.light.data.rotation;
	        tokenCount++;
        });
        return Math.floor(rotationSum/tokenCount) + 90;
	}


	static getAllLightsSet() {
		let allLightsSet = true;
        canvas.tokens.controlled.forEach((token) => {
			if (canvas.scene.tokens.filter(tokenDocument=>tokenDocument.id == token.id && tokenDocument.light.bright != 15).length > 0)
				allLightsSet = false;
        });
        return allLightsSet;
	}


	static toggle() {

		let updates = [];
        const allLightsSet = this.getAllLightsSet();

		// Loop through each selected token.
		canvas.tokens.controlled.forEach(token => {

		    // Get the token documents for the current token.
		    canvas.scene.tokens.filter(tokenDocument=>tokenDocument.id == token.id).forEach((tokenDocument) => {
		        let update = {_id: token.id};

		        // When the light has not been set yet ...
		        if (!allLightsSet)
		        {
		            // ... setup the light.
		            update["light.angle"] = 18;
		            update["light.bright"] = 15;
		            update["light.dim"] = 35;
		            update["light.color"] = "#ffffff";
		            update["light.alpha"] = 0.5;

		            update["light.animation.speed"] = 5;
		            update["light.animation.type"] = "fog";
		            update["light.animation.intensity"] = 5;
		            update["light.animation.reverse"] = false;	
		        }
		        else
		        {
		            // Turn the light off.
		            update["light.bright"] = 0;
		            update["light.dim"] = 0;
		        }

		        updates.push(update);
			});

		});

	    // Perform the updates.
		if (updates.length > 0)
		    canvas.scene.updateEmbeddedDocuments("Token", updates);

	    // Play sound.
		if (updates.length > 0 && game.modules.has("gAudioBundle-1")) {
		    const soundFile = allLightsSet ? "Button_On_Off_064.ogg" : "Light_Switch_019.ogg"
		    AudioHelper.play({src: "modules/gAudioBundle-1/src/Buttons And Switches/" + soundFile, volume: 0.8, autoplay: true, loop: false}, true);    
		}

	}


	static addControlButton(html) {

		// Setup button.
		let button = $("<div><i style='--fa-rotate-angle: " + this.getButtonRotation() + "deg;'></i></div>");
 		button.addClass("control-icon flashlight fa-stack");
 		button.find("i").addClass("fa-solid fa-flashlight fa-rotate-by");

 		// Set button to active when all lights are set.
 		if (this.getAllLightsSet())
 			button.addClass("active");

		// Add button to the left or right side.
    	html.find(".col." + this.buttonSideSetting()).prepend(button);

    	// Register context menu (maybe for future use).
		button.contextmenu(async (event) => {
			event.preventDefault();  
			event.stopPropagation();
		});

    	// Register click.
		button.click(async (event) => {
			event.preventDefault();
			event.stopPropagation();
			this.toggle();
		});
	}


  	// Register keyboard shortcut.
	static registerKeyboardShortcut() {
		game.keybindings.register("flashlight", "toggle", {
			name: game.i18n.localize("FLASHLIGHT.KEYBOARDSHORTCUT.NAME"),
			onDown: () => { this.toggle(); },
			editable: [{ key: "KeyF" }],
			precedence: -1
		});

	}


  	// Register button side setting.
	static registerButtonSideSetting() {
		game.settings.register("flashlight", "button-side", {
			name: game.i18n.localize("FLASHLIGHT.BUTTON.LOCATION.NAME"),
			hint: game.i18n.localize("FLASHLIGHT.BUTTON.LOCATION.HINT"),
			scope: "client",
			config: true,
			type: String,
			choices: {
				"left": game.i18n.localize("FLASHLIGHT.BUTTON.LOCATION.LEFT"),
				"right": game.i18n.localize("FLASHLIGHT.BUTTON.LOCATION.RIGHT") 
			},
			default: "right"
		});
	}


  	// Get button side setting.
	static buttonSideSetting() {
		return game.settings.get("flashlight", "button-side");
	}


  	// Register button rotation setting.
	static registerButtonRotationSetting() {
		game.settings.register("flashlight", "button-rotation-is-on", {
			name: game.i18n.localize("FLASHLIGHT.ROTATE.BUTTON.NAME"),
			hint: game.i18n.localize("FLASHLIGHT.ROTATE.BUTTON.HINT"),
			scope: "client",
			config: true,
			type: Boolean,
			default: "true"
		});
	}


  	// Get button rotation setting.
	static buttonRotationIsOnSetting() {
		return game.settings.get("flashlight", "button-rotation-is-on");
	}

}

Hooks.on("ready", () => {
	Hooks.on("renderTokenHUD", (app, html, drawData) => {
		Flashlight.addControlButton(html);
	});

});


Hooks.on("init", function () {
	Flashlight.registerButtonSideSetting();
	Flashlight.registerButtonRotationSetting();
	Flashlight.registerKeyboardShortcut();
});
