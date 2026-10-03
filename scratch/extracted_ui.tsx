        {/* 2. Interactive Schedules / Agenda Studio */}
        <div className="pt-4 border-t border-zinc-150 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Event Agenda & Sessions ({schedules.length})</span>
              </h4>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                Break your event into distinct tracks, keynotes, or workshop segments.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddSchedule}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Session</span>
            </button>
          </div>

          <div className="space-y-3">
            {schedules.map((item, idx) => (
              <div
                key={idx}
                className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200 space-y-3 relative hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                  <div className="flex items-center gap-2">
                    <span className="w-5 h-5 rounded-md bg-zinc-900 text-white flex items-center justify-center text-[10px] font-black">
                      {idx + 1}
                    </span>
                    <input
                      type="text"
                      value={item.day || `Day ${idx + 1}`}
                      onChange={(e) => handleScheduleChange(idx, 'day', e.target.value)}
                      placeholder="e.g. Day 1 or Morning Track"
                      className="text-xs font-black text-zinc-900 bg-transparent border-b border-dashed border-zinc-300 focus:border-[#E31B23] outline-none px-1 py-0.5 w-32"
                    />
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveSchedule(idx)}
                    className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                    title="Delete session"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Start Time</label>
                    <input
                      type="time"
                      value={item.startTime}
                      onChange={(e) => handleScheduleChange(idx, 'startTime', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">End Time</label>
                    <input
                      type="time"
                      value={item.endTime}
                      onChange={(e) => handleScheduleChange(idx, 'endTime', e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Session Title *</label>
                  <input
                    type="text"
                    value={item.title}
                    onChange={(e) => handleScheduleChange(idx, 'title', e.target.value)}
                    placeholder="e.g. Opening Keynote & Architecture Overview"
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Description</label>
                  <textarea
                    rows={2}
                    value={item.description || ''}
                    onChange={(e) => handleScheduleChange(idx, 'description', e.target.value)}
                    placeholder="Session details, speaker overview, and expected attendee takeaways..."
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 outline-none focus:border-[#E31B23]"
                  />
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 3. Interactive Lineup / Speakers Studio */}
        <div className="pt-4 border-t border-zinc-150 space-y-3">
          <div className="flex items-center justify-between">
            <div>
              <h4 className="text-xs font-black text-zinc-950 uppercase tracking-wider flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Featured Lineup & Speakers ({lineup.length})</span>
              </h4>
              <p className="text-[11px] text-zinc-500 font-medium mt-0.5">
                Spotlight headline speakers, artists, keynote presenters, and panelists.
              </p>
            </div>

            <button
              type="button"
              onClick={handleAddLineupMember}
              className="px-3 py-1.5 rounded-xl bg-zinc-900 hover:bg-zinc-800 text-white text-xs font-bold inline-flex items-center gap-1.5 transition-all cursor-pointer shadow-2xs"
            >
              <Plus className="w-3.5 h-3.5" />
              <span>Add Speaker</span>
            </button>
          </div>

          <div className="space-y-3">
            {lineup.map((member, mIdx) => (
              <div
                key={mIdx}
                className="p-4 rounded-2xl bg-zinc-50/70 border border-zinc-200 space-y-3 relative hover:border-zinc-300 transition-colors"
              >
                <div className="flex items-center justify-between border-b border-zinc-200/80 pb-2">
                  <div className="flex items-center gap-2.5">
                    <img
                      src={member.avatarUrl || 'https://images.unsplash.com/photo-1534528741775-53994a69daeb'}
                      alt={member.name}
                      className="w-8 h-8 rounded-full object-cover border border-zinc-300"
                    />
                    <div>
                      <span className="text-xs font-black text-zinc-900 block">
                        {member.name || `Speaker #${mIdx + 1}`}
                      </span>
                      <span className="text-[10px] text-zinc-500 font-medium block">
                        {member.role || 'Guest Speaker'}
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleRemoveLineupMember(mIdx)}
                    className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-1"
                    title="Delete lineup member"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Full Name *</label>
                    <input
                      type="text"
                      value={member.name}
                      onChange={(e) => handleLineupChange(mIdx, 'name', e.target.value)}
                      placeholder="e.g. Alex Mercer"
                      className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase">Role / Title *</label>
                    <input
                      type="text"
                      value={member.role}
                      onChange={(e) => handleLineupChange(mIdx, 'role', e.target.value)}
                      placeholder="e.g. Lead Systems Architect"
                      className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-bold text-zinc-900 outline-none focus:border-[#E31B23]"
                    />
                  </div>
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Avatar Photo URL</label>
                  <input
                    type="url"
                    value={member.avatarUrl || ''}
                    onChange={(e) => handleLineupChange(mIdx, 'avatarUrl', e.target.value)}
                    placeholder="https://images.unsplash.com/..."
                    className="w-full px-3 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs font-mono text-zinc-800 outline-none focus:border-[#E31B23]"
                  />
                </div>

                <div className="space-y-1">
                  <label className="text-[10px] font-bold text-zinc-500 uppercase">Speaker Bio</label>
                  <textarea
                    rows={2}
                    value={member.bio || ''}
                    onChange={(e) => handleLineupChange(mIdx, 'bio', e.target.value)}
                    placeholder="Brief background or credentials..."
                    className="w-full px-3 py-2 bg-white border border-zinc-200 rounded-xl text-xs font-medium text-zinc-800 outline-none focus:border-[#E31B23]"
                  />
                </div>

                {/* Social Links Sub-list */}
                <div className="space-y-2 pt-1 border-t border-zinc-200/60">
                  <div className="flex items-center justify-between">
                    <label className="text-[10px] font-bold text-zinc-500 uppercase tracking-wide">
                      Social & Profile Links
                    </label>
                    <button
                      type="button"
                      onClick={() => handleAddLineupLink(mIdx, 'github', 'https://github.com/')}
                      className="text-[10px] font-bold text-[#E31B23] hover:underline cursor-pointer inline-flex items-center gap-1"
                    >
                      <Plus className="w-3 h-3" />
                      <span>Add Link</span>
                    </button>
                  </div>

                  {(member.links || []).map((link, lIdx) => (
                    <div key={lIdx} className="flex items-center gap-2">
                      <select
                        value={link.platform}
                        onChange={(e) => {
                          const nextLinks = [...(member.links || [])];
                          nextLinks[lIdx] = { ...nextLinks[lIdx], platform: e.target.value as any };
                          handleLineupChange(mIdx, 'links', nextLinks);
                        }}
                        className="px-2 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-bold text-zinc-800 outline-none"
                      >
                        <option value="github">GitHub</option>
                        <option value="twitter">Twitter / X</option>
                        <option value="linkedin">LinkedIn</option>
                        <option value="website">Website</option>
                      </select>
                      <input
                        type="url"
                        value={link.url}
                        onChange={(e) => {
                          const nextLinks = [...(member.links || [])];
                          nextLinks[lIdx] = { ...nextLinks[lIdx], url: e.target.value };
                          handleLineupChange(mIdx, 'links', nextLinks);
                        }}
                        placeholder="https://..."
                        className="flex-1 px-2.5 py-1 bg-white border border-zinc-200 rounded-lg text-xs font-mono text-zinc-800 outline-none focus:border-[#E31B23]"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveLineupLink(mIdx, lIdx)}
                        className="text-zinc-400 hover:text-red-600 cursor-pointer p-1"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 4. Pre-Ticketing Creation Notice Banner */}
        <div className="p-4 rounded-2xl bg-amber-50 border border-amber-200 flex items-start gap-3 shadow-2xs">
          <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />
          <div className="space-y-0.5">
            <h5 className="text-xs font-black text-amber-950 uppercase tracking-wide">
              Automatic Event Creation Before Ticketing
            </h5>
            <p className="text-xs text-amber-900 font-medium leading-relaxed">
              When you proceed to Step 4, your event will be created and saved as a <span className="font-bold">Draft</span> on the backend server with your exact payload schema. Your ticket tiers can then be attached to this live event ID.
            </p>
          </div>
        </div>



        {/* Event Format Selector */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Layers className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Event Format *</span>
            </label>
            <span className="text-[11px] font-semibold text-zinc-400">Selected: {eventFormat}</span>
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
            {EVENT_FORMATS.map((fmt) => {
              const isSelected = eventFormat === fmt;
              return (
                <button
                  key={fmt}
                  type="button"
                  onClick={() => setEventFormat(fmt)}
                  className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer text-center truncate ${isSelected
                    ? 'bg-zinc-950 text-white border-zinc-950 shadow-xs ring-1 ring-zinc-950'
                    : 'bg-zinc-50 border-zinc-200 text-zinc-700 hover:bg-zinc-100 hover:border-zinc-300'
                    }`}
                >
                  {fmt}
                </button>
              );
            })}
          </div>
        </div>

        {/* Categories Multi-Select Chips */}
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
              <Tag className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Event Categories & Tags *</span>
            </label>
            <span className="text-[11px] text-zinc-500 font-medium">
              {eventCategories.length} selected
            </span>
          </div>

          {/* Active Selected Category Tags */}
          <div className="flex flex-wrap gap-2 min-h-[38px] p-2.5 bg-zinc-50 border border-zinc-200 rounded-2xl">
            {eventCategories.map((cat) => (
              <span
                key={cat}
                className="inline-flex items-center gap-1.5 px-3 py-1 bg-white border border-zinc-300 text-zinc-900 rounded-xl text-xs font-bold shadow-2xs"
              >
                <span>{cat}</span>
                <button
                  type="button"
                  onClick={() => handleRemoveCategory(cat)}
                  className="text-zinc-400 hover:text-red-600 transition-colors cursor-pointer p-0.5"
                  title={`Remove ${cat}`}
                >
                  <X className="w-3 h-3" />
                </button>
              </span>
            ))}

            {/* Custom Category Input */}
            <div className="inline-flex items-center gap-1.5">
              <input
                type="text"
                value={customCategoryInput}
                onChange={(e) => setCustomCategoryInput(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter') {
                    e.preventDefault();
                    handleAddCustomCategory();
                  }
                }}
                placeholder="+ Add tag (press Enter)"
                className="px-2.5 py-1 text-xs font-semibold bg-transparent outline-none placeholder-zinc-400 text-zinc-900 w-36"
              />
              {customCategoryInput.trim() && (
                <button
                  type="button"
                  onClick={handleAddCustomCategory}
                  className="px-2 py-1 bg-zinc-900 text-white rounded-lg text-[10px] font-bold hover:bg-zinc-800 transition-all cursor-pointer"
                >
                  Add
                </button>
              )}
            </div>
          </div>

          {/* Popular Tag Suggestions */}
          <div className="space-y-1">
            <span className="text-[10px] font-bold text-zinc-400 uppercase tracking-wide">
              Suggested Categories:
            </span>
            <div className="flex flex-wrap gap-1.5">
              {POPULAR_CATEGORY_TAGS.map((tag) => {
                const isAdded = eventCategories.includes(tag);
                return (
                  <button
                    key={tag}
                    type="button"
                    onClick={() => {
                      if (isAdded) {
                        handleRemoveCategory(tag);
                      } else {
                        setEventCategories((prev) => [...prev, tag]);
                      }
                    }}
                    className={`px-2.5 py-1 rounded-lg text-xs font-medium border transition-all cursor-pointer ${isAdded
                      ? 'bg-red-50 border-red-200 text-[#E31B23] font-bold'
                      : 'bg-white border-zinc-200 text-zinc-600 hover:border-zinc-300'
                      }`}
                  >
                    {isAdded ? `✓ ${tag}` : `+ ${tag}`}
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* Visibility & Spotlight Toggle */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
          <div className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2">
            <label className="text-xs font-bold text-zinc-800 flex items-center justify-between">
              <span>Event Visibility</span>
              <span className={`px-2 py-0.5 rounded-md text-[10px] font-black uppercase ${visibility === 'public' ? 'bg-emerald-100 text-emerald-800' : 'bg-zinc-200 text-zinc-700'
                }`}>
                {visibility}
              </span>
            </label>
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setVisibility('public')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${visibility === 'public'
                  ? 'bg-white text-zinc-950 border-zinc-900 shadow-2xs ring-1 ring-zinc-900'
                  : 'bg-zinc-100/80 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
              >
                Public
              </button>
              <button
                type="button"
                onClick={() => setVisibility('private')}
                className={`py-2 px-3 rounded-xl text-xs font-bold border transition-all cursor-pointer ${visibility === 'private'
                  ? 'bg-white text-zinc-950 border-zinc-900 shadow-2xs ring-1 ring-zinc-900'
                  : 'bg-zinc-100/80 border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                  }`}
              >
                Private
              </button>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium">
              {visibility === 'public'
                ? 'Listed on Eventa marketplace & indexed on search engines.'
                : 'Only accessible to users with the direct secret link.'}
            </p>
          </div>

          <div className="p-3.5 rounded-2xl border border-zinc-200 bg-zinc-50/70 space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-zinc-800 flex items-center gap-1.5">
                <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
                <span>Marketplace Spotlight</span>
              </label>
              <label className="relative inline-flex items-center cursor-pointer">
                <input
                  type="checkbox"
                  checked={isFeatured}
                  onChange={(e) => setIsFeatured(e.target.checked)}
                  className="sr-only peer"
                />
                <div className="w-9 h-5 bg-zinc-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-zinc-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-[#E31B23]"></div>
              </label>
            </div>
            <p className="text-[11px] text-zinc-500 font-medium leading-relaxed">
              Highlight in the "Featured & Spotlight" carousel on the Eventa homepage for increased attendee visibility.
            </p>
          </div>
        </div>

        {/* Cover Photo & Event Flyer Studio */}
        <div className="space-y-3 pt-4 border-t border-zinc-100">
          <div className="flex items-center justify-between">
            <div>
              <label className="text-xs font-bold text-zinc-900 block">Cover Photo & Event Flyer (bannerUrl)</label>
              <span className="text-[11px] text-zinc-400">High-res 16:9 banner displayed across event discovery & passes</span>
            </div>
            <span className="text-[10px] font-bold px-2 py-0.5 bg-zinc-100 text-zinc-600 rounded-full border border-zinc-200">
              16:9 Recommended
            </span>
          </div>

          {/* Cover Mode Selector */}
          <div className="flex items-center gap-1.5 p-1 bg-zinc-100/80 rounded-xl border border-zinc-200/60 text-xs font-bold">
            <button
              type="button"
              onClick={() => setCoverMode('upload')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === 'upload'
                ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                : 'text-zinc-600 hover:text-zinc-950'
                }`}
            >
              <Upload className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Upload from Device</span>
            </button>
            <button
              type="button"
              onClick={() => setCoverMode('preset')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === 'preset'
                ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                : 'text-zinc-600 hover:text-zinc-950'
                }`}
            >
              <Sparkles className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Curated Presets (50)</span>
            </button>
            <button
              type="button"
              onClick={() => setCoverMode('url')}
              className={`flex-1 py-1.5 px-3 rounded-lg flex items-center justify-center gap-1.5 transition-all cursor-pointer ${coverMode === 'url'
                ? 'bg-white text-zinc-950 shadow-2xs font-extrabold'
                : 'text-zinc-600 hover:text-zinc-950'
                }`}
            >
              <ExternalLink className="w-3.5 h-3.5 text-[#E31B23]" />
              <span>Image Link</span>
            </button>
          </div>

          {/* TAB 1: UPLOAD FROM DEVICE */}
          {coverMode === 'upload' && (
            <div className="space-y-2">
              <input
                ref={coverFileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => {
                  const file = e.target.files?.[0];
                  if (file) handleCoverFileProcess(file);
                }}
                className="hidden"
              />

              {imageUrl && imageUrl.startsWith('data:image') ? (
                <div className="relative rounded-2xl overflow-hidden border border-zinc-200 bg-zinc-900 group shadow-xs">
                  <img src={imageUrl} alt="Uploaded Event Flyer" className="w-full h-44 sm:h-52 object-cover" />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3 p-4">
                    <button
                      type="button"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="px-3.5 py-2 bg-white text-zinc-950 text-xs font-bold rounded-xl shadow-md hover:bg-zinc-100 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Upload className="w-3.5 h-3.5 text-[#E31B23]" />
                      <span>Replace Flyer</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        setImageUrl(PRESET_COVERS[0].url);
                        setCoverFileName('');
                        if (coverFileInputRef.current) coverFileInputRef.current.value = '';
                      }}
                      className="px-3.5 py-2 bg-red-600 text-white text-xs font-bold rounded-xl shadow-md hover:bg-red-700 transition-all flex items-center gap-1.5 cursor-pointer"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>Remove</span>
                    </button>
                  </div>
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-md px-2.5 py-1 rounded-full text-[10px] font-black text-white flex items-center gap-1.5">
                    <CheckCircle2 className="w-3 h-3 text-emerald-400" />
                    <span>Device Flyer Active {coverFileName ? `• ${coverFileName}` : ''}</span>
                  </div>
                </div>
              ) : (
                <div
                  onDragOver={(e) => { e.preventDefault(); setIsDraggingCover(true); }}
                  onDragLeave={() => setIsDraggingCover(false)}
                  onDrop={(e) => {
                    e.preventDefault();
                    setIsDraggingCover(false);
                    const file = e.dataTransfer.files?.[0];
                    if (file) handleCoverFileProcess(file);
                  }}
                  onClick={() => coverFileInputRef.current?.click()}
                  className={`h-44 sm:h-48 border-2 border-dashed rounded-2xl flex flex-col items-center justify-center p-6 text-center cursor-pointer transition-all ${isDraggingCover
                    ? 'border-[#E31B23] bg-red-50/40 ring-4 ring-red-100'
                    : 'border-zinc-200 hover:border-zinc-300 hover:bg-zinc-50/70 bg-zinc-50/40'
                    }`}
                >
                  {isUploadingCover ? (
                    <div className="flex flex-col items-center gap-2">
                      <Loader2 className="w-8 h-8 text-[#E31B23] animate-spin" />
                      <span className="text-xs font-bold text-zinc-700">Uploading promotional flyer...</span>
                    </div>
                  ) : (
                    <>
                      <div className="w-12 h-12 rounded-2xl bg-red-50 text-[#E31B23] flex items-center justify-center mb-2.5 shadow-2xs group-hover:scale-105 transition-transform">
                        <Upload className="w-6 h-6" />
                      </div>
                      <span className="text-xs font-bold text-zinc-900">
                        Click to browse or drag & drop event banner flyer
                      </span>
                      <span className="text-[11px] text-zinc-400 mt-1 max-w-xs">
                        Supports high-definition JPG, PNG, WEBP up to 10MB. 16:9 aspect ratio looks sharpest.
                      </span>
                    </>
                  )}
                </div>
              )}
            </div>
          )}

          {/* TAB 2: PRESET GALLERY (50 CURATED PRESETS) */}
          {coverMode === 'preset' && (
            <div className="space-y-3 bg-zinc-50/60 p-3.5 rounded-2xl border border-zinc-200/80">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2.5">
                <div className="flex items-center gap-2">
                  <span className="text-xs font-black text-zinc-900">
                    Curated Photography Studio
                  </span>
                  <span className="text-[10px] font-black px-2 py-0.5 bg-red-100/70 text-[#E31B23] rounded-full border border-red-200">
                    50 High-Res Presets
                  </span>
                </div>

                {/* Quick Search */}
                <div className="relative w-full sm:w-48">
                  <Search className="w-3.5 h-3.5 text-zinc-400 absolute left-2.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                  <input
                    type="text"
                    value={presetSearchQuery}
                    onChange={(e) => setPresetSearchQuery(e.target.value)}
                    placeholder="Filter presets..."
                    className="w-full pl-8 pr-7 py-1.5 bg-white border border-zinc-200 rounded-xl text-xs text-zinc-900 placeholder-zinc-400 outline-none focus:border-[#E31B23]"
                  />
                  {presetSearchQuery && (
                    <button
                      type="button"
                      onClick={() => setPresetSearchQuery('')}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-700 cursor-pointer"
                    >
                      <X className="w-3 h-3" />
                    </button>
                  )}
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex items-center gap-1.5 overflow-x-auto pb-1 scrollbar-none text-xs">
                {PRESET_CATEGORIES.map((cat) => {
                  const isSelected = presetCategoryFilter === cat;
                  const count =
                    cat === 'All'
                      ? PRESET_COVERS.length
                      : PRESET_COVERS.filter((p) => p.category === cat).length;
                  return (
                    <button
                      key={cat}
                      type="button"
                      onClick={() => setPresetCategoryFilter(cat)}
                      className={`px-2.5 py-1 rounded-lg text-[11px] font-bold whitespace-nowrap transition-all cursor-pointer ${isSelected
                        ? 'bg-zinc-900 text-white shadow-2xs'
                        : 'bg-white border border-zinc-200 text-zinc-600 hover:bg-zinc-100'
                        }`}
                    >
                      {cat} ({count})
                    </button>
                  );
                })}
              </div>

              {/* Gallery Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5 max-h-56 overflow-y-auto pr-1">
                {filteredPresets.map((preset, pIdx) => {
                  const isChosen = imageUrl === preset.url;
                  return (
                    <div
                      key={pIdx}
                      onClick={() => {
                        setImageUrl(preset.url);
                        showNotification(`Applied "${preset.name}" cover image`, 'success');
                      }}
                      className={`group relative rounded-xl overflow-hidden cursor-pointer border-2 transition-all ${isChosen
                        ? 'border-[#E31B23] ring-2 ring-red-200 shadow-sm'
                        : 'border-transparent hover:border-zinc-300'
                        }`}
                    >
                      <img
                        src={preset.url}
                        alt={preset.name}
                        className="w-full h-20 sm:h-22 object-cover group-hover:scale-105 transition-transform duration-300"
                        loading="lazy"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent opacity-90 p-1.5 flex flex-col justify-end">
                        <span className="text-[10px] font-bold text-white leading-tight truncate">
                          {preset.name}
                        </span>
                      </div>
                      {isChosen && (
                        <div className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-[#E31B23] text-white flex items-center justify-center shadow-xs">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* TAB 3: CUSTOM URL */}
          {coverMode === 'url' && (
            <div className="space-y-2">
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://images.unsplash.com/..."
                className="w-full px-3.5 py-2.5 bg-zinc-50 border border-zinc-200 rounded-xl text-xs font-mono text-zinc-800 placeholder-zinc-400 outline-none focus:border-[#E31B23] focus:bg-white transition-all"
              />
              {imageUrl && !imageUrl.startsWith('data:image') && (
                <div className="relative rounded-xl overflow-hidden border border-zinc-200 h-32 bg-zinc-100">
                  <img src={imageUrl} alt="Cover Preview" className="w-full h-full object-cover" />
                </div>
              )}
            </div>
          )}
        </div>
