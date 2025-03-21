# EDCoPilot Integration

We are excited to work with Razzafrag on integrating **COVAS:NEXT** with **EDCoPilot**!
This currently has two benefits:
1) You can see the COVAS:NEXT dialogue in EDCoPilot Voice Activity
2) You can prevent both applications from talking over each other

## Show dialogue in EDCoPilot
With EDCoPilot installed, COVAS:NEXT will automatically add a new configuration option to enable EDCoPilot.
This option is enabled by default, so it should work without further modification.

## Preventing both applications from talking at the same time
By default, both EDCoPilot and COVAS:NEXT will react to certain events inside your game. 

We provide two different solutions:
1) Let COVAS:NEXT decide what, where and how to comment **(COVAS:NEXT Dominant Mode)**
  
2) Let EDCoPilot decide what, where and how to comment **(EDCoPilot Dominant Mode)**

### 1. COVAS:NEXT Dominant Mode 
This mode lets you talk to COVAS:NEXT as usual, while COVAS:NEXT use EDCoPilot event commentary is muted. This is the default mode and ensures that COVAS:NEXT comments are low-latency and not delayed by EDCoPilot commentary.

In order to mute EDCoPilot game commentary, you should open EDCoPilot Settings -> Ship AI Personality -> Disable "EDCoPilot Dominant"

### 2. EDCoPilot Dominant Mode

This mode also lets you talk to COVAS:NEXT, while EDCoPilot also generates its own commentary. In order to avoid excessive and redundant commentary, you should configure the behaviour of COVAS:NEXT to only respond to those events that EDCoPilot does not already comment on in the Behaviour tab.
   
In order enable both applications commentary, you need to enable the `EDCoPilot-Dominant` setting inside of COVAS:NEXT.

This setting will mute COVAS:NEXT and instead send all text over to EDCoPilot, where it will be read out, but might be delayed by ongoing EDCoPilot commentary and generally higher latency.

## Future Plans
We aim to expand this functionality in the future.

- Add functionality to control the EDCoPilot UI using COVAS:NEXT commands.
- Let COVAS:NEXT access EDCoPilot UI contents.
- Add support for time sensitive messages (like Time Trails) to COVAS:NEXT.
- Make the integration more seamless.
