import re

with open("src/pages/organizer/CreateEvent.tsx", "r") as f:
    lines = f.readlines()

# Locate "2. Interactive Schedules / Agenda Studio"
schedule_start = -1
for i, line in enumerate(lines):
    if "{/* 2. Interactive Schedules / Agenda Studio */}" in line:
        schedule_start = i
        break

if schedule_start == -1:
    print("Could not find start")
    exit(1)

# The end of the injected UI is just before the last </div></OrganizerDashboardLayout>
end_idx = -1
for i in range(len(lines)-1, -1, -1):
    if "</OrganizerDashboardLayout>" in lines[i]:
        end_idx = i - 2
        break

extracted = lines[schedule_start:end_idx]
with open("scratch/extracted_ui.tsx", "w") as f:
    f.writelines(extracted)

print(f"Extracted {len(extracted)} lines to scratch/extracted_ui.tsx")

# Also delete these lines from the original file
del lines[schedule_start:end_idx]
with open("src/pages/organizer/CreateEvent.tsx", "w") as f:
    f.writelines(lines)
print("Deleted extracted lines from original file.")

