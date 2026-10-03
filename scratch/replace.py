with open("scratch/extracted_ui.tsx", "r") as f:
    lines = f.readlines()

schedule_ui = lines[:100]
lineup_ui = lines[100:275]
branding_ui = lines[275:]

with open("src/pages/organizer/CreateEvent.tsx", "r") as f:
    orig = f.readlines()

out = []
i = 0
in_step_4 = False
while i < len(orig):
    line = orig[i]
    
    if "{step === 3 && (" in line:
        out.append(line)
        in_step_3 = True
        while True:
            i += 1
            if orig[i].strip() == ")}" and "</div>" in orig[i-1]:
                out.extend(schedule_ui)
                out.append(orig[i])
                break
            else:
                out.append(orig[i])
                
    elif "{step === 4 && (" in line:
        in_step_4 = True
        
    elif "{/* STEP 5: POLICIES */}" in line:
        in_step_4 = False
        out.append("""              {/* STEP 4: LINEUP & SPEAKERS */}
              {step === 4 && (
                <div className="space-y-6 animate-in fade-in duration-200">
""" + "".join(lineup_ui) + """
                </div>
              )}

              {/* STEP 5: APPEARANCE & BRANDING */}
              {step === 5 && (
                <div className="space-y-6 animate-in fade-in duration-200">
""" + "".join(branding_ui) + """
                </div>
              )}

""")
        out.append(line.replace("STEP 5:", "STEP 6:"))
        
    elif "{step === 5 && (" in line and not in_step_4:
        out.append(line.replace("{step === 5 && (", "{step === 6 && ("))
        
    elif "{step === 6 && (" in line and not in_step_4:
        out.append(line.replace("{step === 6 && (", "{step === 7 && ("))
        
    elif "STEP 6: LAUNCHPAD" in line and not in_step_4:
        out.append(line.replace("STEP 6:", "STEP 7:"))
        
    else:
        if not in_step_4:
            out.append(line)
            
    i += 1

with open("src/pages/organizer/CreateEvent.tsx", "w") as f:
    f.writelines(out)

print("Replaced!")
