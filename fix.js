import fs from 'fs';
let content = fs.readFileSync('src/components/UserDashboard.tsx', 'utf8');

// Fix the "r            {/* SUBTAB: OVERVIEW PANEL */}" mess
content = content.replace(/r\s+\{\/\* SUBTAB: OVERVIEW PANEL \*\/\}/g, '{/* SUBTAB: OVERVIEW PANEL */}');

// Remove double Event subtabs if they exist
// I saw line 567: {/* SUBTAB: EVENT PROGRAMS SHEDULE */}
// And it's also inside my manual replace.

// I'll just write a cleaner fix script that finds the whole <AnimatePresence> block and replaces it.
const startMarker = '<AnimatePresence mode="wait">';
const endMarker = '</AnimatePresence>';
const startIndex = content.indexOf(startMarker);
const endIndex = content.lastIndexOf(endMarker);

if (startIndex !== -1 && endIndex !== -1) {
  const newAnimatePresence = `<AnimatePresence mode="wait">
            {/* SUBTAB: OVERVIEW PANEL */}
            {activeSubTab === 'overview' && (
              <UserOverview 
                currentUser={currentUser}
                registration={registration}
                payment={payment}
              />
            )}

            {/* SUBTAB: DIGITAL CERTIFICATE PANEL */}
            {activeSubTab === 'certificate' && (
              <DigitalCertificateTab 
                currentUser={currentUser}
                registration={registration}
                payment={payment}
                isApproved={isApproved}
                setCurrentTab={setCurrentTab}
              />
            )}

            {/* SUBTAB: EVENT PROGRAMS SHEDULE */}
            {activeSubTab === 'events' && (
              <JubileeEvents 
                events={events}
                isApproved={isApproved}
              />
            )}

            {/* SUBTAB: NOTICE BOARD PANEL */}
            {activeSubTab === 'notices' && (
              <NoticeBoard 
                notices={notices}
              />
            )}

            {/* SUBTAB: APPLY FORM PANEL WITH SUBMISSIONS LIST */}
            {activeSubTab === 'apply' && (
              <motion.div
                key="subtab-apply"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                className="space-y-6"
              >
                {/* Apply content ... I'll leave it for now or copy it back */}
                {/* Actually, it was missing in the previous view's output because I truncated it */}
              </motion.div>
            )}

            {/* SUBTAB: PROFILE SETTINGS */}
            {activeSubTab === 'profile' && (
              <ProfileSettings 
                currentUser={currentUser}
                name={name}
                setName={setName}
                mobile={mobile}
                setMobile={setMobile}
                batch={batch}
                setBatch={setBatch}
                photo={photo}
                saving={saving}
                handleSaveProfile={handleSaveProfile}
                handleFileChange={handleFileChange}
                isDragging={isDragging}
                handleDragOver={handleDragOver}
                handleDragLeave={handleDragLeave}
                handleDrop={handleDrop}
              />
            )}
          </AnimatePresence>`;
  
  // Wait, I need the "apply" content back. 
  // I'll just match the sections more carefully.
}

// Rewriting fix.js to be very surgical.
// 1. Fix the "r    " typo.
content = content.replace(/r\s+\{\/\* SUBTAB: OVERVIEW PANEL \*\/\}/, 'return;\n      }\n    }\n\n    {/* SUBTAB: OVERVIEW PANEL */}');

// 2. Fix the Profile section. I'll just use edit_file for that later.
fs.writeFileSync('src/components/UserDashboard.tsx', content);
console.log('Fixed UserDashboard.tsx structural typo');
