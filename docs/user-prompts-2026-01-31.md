# User Prompts - January 31, 2026

## Session Log

---

### Prompt 1 - Initial Project Setup
Here is a prompt that I gave to another AI. After we talked about it, I think I want to go with the REZ gameplay style. I wanted to build something with React three fiber, shaders, physics (rapier), koota for ecs, etc. Like a really modern and clean implementation of something. I have a good boilerplate to start with, but I don't really know actually what I want to build. I was originally going to do Katamari, but I found the mobile app on the phone and I've been playing with that and I don't feel the need to rebuild that. Give me some ideas. Ideally something that I can control with a character. That game Rez on PlayStation comes to mind, actually. Like an upgraded version of that game. It's pretty simple rail shooting, and I could probably make it very extensible. Something like that, perhaps. Something I can play with a controller. Here's the boilerplate I was talking about. https://github.com/greengem/threejs-solar-system. Oh yeah, I forgot about DREI. We're going to use that probably pretty heavily too. Oh yeah, please make this best practices report into a Markdown file that we can save and reference for later as best practices that we're building with.

[Included: Full REZ HD system prompt with gameplay rules, performance rules, architecture, visual/style rules]

Also, let's create a GitHub repo and push that up to my GitHub so that we can track what we have going on.

---

### Prompt 2 - Additional Libraries
React Postprocessing https://github.com/pmndrs/gltfjsx Let's add these as well.

---

### Prompt 3 - Next Steps & Audio
After you were done with all that, And you've made a report on the modern best practices, GACP, then move on to these steps if we haven't already: implement the spline-based rail track, lock-on targeting, enemy spawning, and audio/beat detection. Then GACP again.

---

### Prompt 4 - Sample Audio
Do we have sample audio MP3s that we can use for gameplay testing? We need to get some somewhere online. If not, it should be electronic music, of course.

---

### Prompt 5 - Input System
We should be able to use both keyboard and gamepad. It defaults to keyboard and mouse. Or switches to gamepad if it's detected.

---

### Prompt 6 - Debug Tools
Oh yeah, we need to grab one of those FPS monitors that I often see on 3JS demos. I don't know what it's called, but it's very popular. I think actually there might be an advanced one that has more than just FPS. There's like several different mountain charts in one plug-in that you can enable. Actually, now that I think about it, there's like some sort of thing where it's a whole menu of parameters that you can mess with. It's the one that's standard with all these 3D demos on the web. I forget what that's called.

---

### Prompt 7 - Turbo Console Log & Component IDs
Yeah, we need to use the Turbo Console Log Syntax where we can have a 🚀 emoji and then it shows the file with the file name, the line number, the enclosing function, the variable name, and then the variable value. This is for any browser console logs that we need to track when it's erroring, and we're debugging with Agent Browser. Look up Turbo Console Log syntax, you'll know what I mean. We should use the most expressive version that includes everything that I just gave you and potentially anything more that I'm missing. Also, every single component in the React tree should have an ID like a UUID so that we can very fast look up where something might be in the markup if needed to be.

---

### Prompt 8 - Difficulty & Graphics Presets
Let's create some default settings for different difficulties as well as different rendering capabilities. Just like we would on a PC game where it's easy, medium, or hard. And then for graphics quality, low, medium, and high. This way, we can easily toggle between our experience and not have to dial stuff in manually all the time.

---

### Prompt 9 - CLAUDE.md Creation
If there is no Claud.md, then we should make one with init and put this rule about hard-coded UUIDs inside of it.

---

### Prompt 10 - Docs Folder Reference
We should have a docs folder that has the best practices and any Markdown reports about our research, and use those in reference through Claude.md. I forget the syntax. It's like at doc slash or something like that. Like whatever the folder name is, you can look online for how to do that.

---

### Prompt 11 - Hardcoded IDs Clarification
I see you are still dynamically rendering the component IDs. I want these literally hard coded in the markup, not referenced somewhere. Like I want them in the files as raw text, like we have some CSS values with quotes. I want, like, ID equals open quote and then a hard coded value, close quote. Stop trying to do dynamic ID rendering.

---

### Prompt 12 - Commit Checkpoint
GACP, when you get the chance, because we're doing a lot right now.

---

### Prompt 13 - Menu System & Prompt Archive
Something else I just thought of is if we haven't done already, maybe you have done it and I just haven't looked at the file system yet myself manually. But obviously if we're building a 3D game, we should have a start menu system and of course the settings and control layout configuration. You know, all the basics. Before we do that though, can you actually output a markdown of all of my inputs that I've given you called "user prompts" with today's date and time so that I can track everything that I've been giving you before the context does the auto-compact? Save that to our docs folder.

---

### Prompt 14 - Implement Menu System
Want me to implement the full menu system now? I can create: A proper menu state machine, Pause overlay, Settings panel with all options, Control rebinding interface. Yes, lets do that after you have gacp.

---

### Prompt 15 - Commit & Proceed
Commit the documentation file and then proceed to implementing the menu system.

---

### Prompt 16 - Prompt Tracking Request
Check the time after every prompt that we do, and if it's over one minute, I want you to update the user prompts file with any prompts that are missing. I want to keep a running log of all the prompts that I've input so far.

---

### Prompt 17 - GACP Checkpoint
GACP when you get the chance!

---

## Summary of Requested Features

- [x] REZ HD-style on-rails rhythm shooter
- [x] React Three Fiber + Drei + Rapier + Koota + Zustand
- [x] GitHub repo creation
- [x] Best practices documentation
- [x] Spline-based rail track
- [x] Lock-on targeting system
- [x] Enemy spawning with object pooling
- [x] Audio/beat detection hooks
- [x] Keyboard + Gamepad input with auto-detection
- [x] r3f-perf (FPS monitor) + Leva (parameter tweaking)
- [x] Turbo Console Log utility
- [x] Hardcoded component IDs
- [x] Difficulty presets (easy/medium/hard)
- [x] Graphics quality presets (low/medium/high)
- [x] CLAUDE.md with project rules
- [x] Docs folder with @docs/ references
- [x] Full menu state machine (menuStore.ts)
- [x] Pause overlay with resume/settings/quit
- [x] Settings panel (audio/graphics/controls tabs)
- [x] Control rebinding interface with keyboard support
- [x] Game over & level complete screens
