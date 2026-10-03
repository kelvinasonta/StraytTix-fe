with open("src/pages/organizer/CreateEvent.tsx", "r") as f:
    lines = f.readlines()

out = []
i = 0
while i < len(lines):
    line = lines[i]

    # Delete the orphan `)}` at line 1826 (0-indexed 1825) 
    # and everything until `{/* STEP 4: TICKETING ENGINE */}` at line 1934 (0-indexed 1933)
    # These are the stray date/timezone fields that were left over from the old step 3 position
    if line.strip() == ')}' and i + 2 < len(lines) and '1-Click Quick Presets' in lines[i+2]:
        # Skip from this line to (but not including) `{/* STEP 4: TICKETING ENGINE */}`
        while i < len(lines) and '{/* STEP 4: TICKETING ENGINE */}' not in lines[i]:
            i += 1
        # Also skip duplicate comments, keep only the LINEUP one
        while i < len(lines) and 'TICKETING ENGINE' in lines[i]:
            i += 1
        continue  # The LINEUP comment will be processed on next iteration

    # Fix indentation of the Lineup Studio content (8-space -> 26-space to match step wrapper)
    # These are the lines starting after `{step === 4 && (` wrapper
    if '{/* 3. Interactive Lineup / Speakers Studio */}' in line and line.startswith('        '):
        # This block has 8-space indent, should be 18-space
        # Re-indent all lines until we hit the closing `</div>` for this block
        # Collect all the lineup section lines
        lineup_block = []
        j = i
        depth = 0
        while j < len(lines):
            ln = lines[j]
            stripped = ln.strip()
            if stripped.startswith('<div') or stripped.startswith('{lineup.map'):
                depth += stripped.count('<div') + stripped.count('{lineup')
            if stripped == '</div>' or stripped.startswith('</div>'):
                depth -= 1
            lineup_block.append(ln)
            if j > i and depth <= 0 and stripped in ('</div>', '</div>}'):
                j += 1
                break
            j += 1
        # Re-indent: 8 spaces -> 18 spaces
        for ln in lineup_block:
            if ln.startswith('        '):  # 8+ spaces
                out.append('                  ' + ln[8:])
            elif ln.strip() == '':
                out.append('\n')
            else:
                out.append(ln)
        i = j
        continue

    out.append(line)
    i += 1

with open("src/pages/organizer/CreateEvent.tsx", "w") as f:
    f.writelines(out)
print(f"Done. Total lines: {len(out)}")
