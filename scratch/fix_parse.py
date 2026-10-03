with open("src/pages/organizer/CreateEvent.tsx", "r") as f:
    lines = f.readlines()

# Find line 1724 (0-indexed: 1723)
# The problem: the recurring JSX block is missing its closing )}
# Line 1723 (1-indexed) is `                    </div>` after the recurring inner div
# Line 1724 is `        {/* 2. Interactive Schedules / Agenda Studio */}`
# We need to insert `                  )}` between them

# Find the exact location
target_comment = "        {/* 2. Interactive Schedules / Agenda Studio */}"
inject_idx = None
for i, line in enumerate(lines):
    if line.rstrip() == target_comment:
        inject_idx = i
        break

if inject_idx is None:
    print("ERROR: Could not find target comment line!")
    exit(1)

print(f"Found target at line {inject_idx + 1} (1-indexed)")
print(f"  Line content: {repr(lines[inject_idx])}")
print(f"  Line before: {repr(lines[inject_idx - 1])}")
print(f"  Line before that: {repr(lines[inject_idx - 2])}")

# Insert the closing )} and fix indentation of the schedule UI
new_lines = lines[:inject_idx]
new_lines.append("                  )}\n")
new_lines.append("\n")

# Now add the schedule UI with corrected indentation
# The extracted schedule UI had 8-space indent (from the preview column)
# but now it needs to be inside the step 3 content div (12-space indent at top level)
schedule_lines = lines[inject_idx:]
# Find where the schedule section ends (look for "3. Interactive Lineup" or closing of this block)
end_marker = "        {/* 3. Interactive Lineup / Speakers Studio */}"
end_idx = None
for i, line in enumerate(schedule_lines):
    if line.rstrip() == end_marker:
        end_idx = i
        break

if end_idx is None:
    print("ERROR: Could not find end of schedule section!")
    exit(1)

print(f"Schedule section spans {end_idx} lines")

# Fix indentation: 8 spaces -> 18 spaces for each line in schedule section
for line in schedule_lines[:end_idx]:
    if line.startswith("        "):  # 8 spaces
        new_lines.append("                  " + line[8:])
    elif line.strip() == "":
        new_lines.append("\n")
    else:
        new_lines.append(line)

# Now append the rest
new_lines.extend(schedule_lines[end_idx:])

with open("src/pages/organizer/CreateEvent.tsx", "w") as f:
    f.writelines(new_lines)

print("Fixed!")
