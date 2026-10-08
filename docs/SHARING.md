# Sharing a fresh Study Buddy

Use the prepared amelia-study-buddy-github-source.zip for a new GitHub repository. Extract it into a new folder and initialize that folder as a new repository. It contains editable code, model assets, licenses, and build instructions. It excludes node_modules, builds, Git history, original lecture decks, extraction files, agent settings, temporary exports, and browser backups.

The recovered development checkout has older tracked lecture originals in its history. Adding an ignore rule does not remove already-tracked files or history. The prepared source ZIP avoids carrying that history into the new repository. It does not publish anything automatically.

No user's results or notes are embedded in the source ZIP or production ZIP. Progress uses browser localStorage (biol2401-study-hub-v1); theme uses a separate preference. New users start fresh. Revisiting the same app origin in the same browser retains that browser's progress until reset.

## Hand the same computer to Amelia

1. Export a backup if you want to keep your practice history.
2. Open Add chapters and review the Start fresh reset.
3. Reset progress. Imported materials stay; scores, completion, flashcard marks, weak spots, bookmarks, anatomy notes, and challenge results clear.
4. Study desk will show zero learning progress. Undo reset is available while the panel stays open; the backup provides longer-term recovery.

Different browser profiles provide separate progress without adding accounts. They are not password-protected app profiles.

## Share additions without your progress

Send a TXT/Markdown/PDF/PPTX chapter file or an authored JSON chapter pack for each classmate to import. Download the JSON template in Add chapters. A full study backup includes your progress, so it is not a materials-only handoff.

For source pack edits, run the README verification commands, rebuild, and share the updated source/build. Runtime imports are stored locally and do not modify repository files.

## Hosting

The production ZIP is a static app for HTTP hosting at a root URL. GitHub downloads work locally with Node and the README commands. GitHub Pages project URLs such as /repository-name/ require base-path changes before deployment. No deployment is included.
