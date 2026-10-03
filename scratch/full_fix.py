with open("src/pages/organizer/CreateEvent.tsx", "r") as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    line = lines[i]
    stripped = line.strip()

    # ----- Problem 1: orphan `)}` at line 1826 (0-based: 1825) -----
    # After the Agenda Studio closes at line 1824, line 1826 has an orphan `)}`.
    # We need to remove it.
    # Detect: the agenda studio ended with `</div>` (line 1823/1824) then blank (1825), then `)}` (1826)
    # Let's track by context: if we see a lone `)}`  with 28 spaces indent right after 
    # the end of the Agenda section, skip it.
    if (stripped == ')}'
            and line.startswith('                            ')  # 28 spaces
            and i > 0
            and lines[i-1].strip() == ''):
        # Check if the next non-blank line is a comment (Quick Date Presets or similar)
        j = i + 1
        while j < len(lines) and lines[j].strip() == '':
            j += 1
        if j < len(lines) and ('Quick Date Presets' in lines[j] or 'Start Date' in lines[j]):
            # This is the orphan )} - skip it
            i += 1
            continue

    # ----- Problem 2: date/time fields inside step 4 lineup block -----
    # After step 4 opens `{step === 4 && (`, the date fields + timezone 
    # from step 3 are erroneously placed here. We need to remove them from step 4.
    # The step 4 block starts around line 1934-1936, and the mis-placed content is lines 1828-1931
    # Actually looking at the output: the content between the orphan `)}` at 1826 
    # and `{/* STEP 4: TICKETING ENGINE */}` at 1934 is the misplaced step 3 content.
    # We should NOT output those lines when inside the step 3 block.

    out.append(line)
    i += 1

with open("src/pages/organizer/CreateEvent.tsx", "w") as f:
    f.writelines(out)
print("Pass 1 done")
