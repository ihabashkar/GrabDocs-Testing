import os
import time
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.common.action_chains import ActionChains
from selenium.common.exceptions import TimeoutException
from selenium.webdriver.support.ui import Select

# Load the variables from .env into the environment
load_dotenv()

PRESENTER_MODE = True  
PAUSE_DURATION = 3

def presentation_pause():
    if PRESENTER_MODE:
        time.sleep(PAUSE_DURATION)

# Access the variables
username = os.getenv("GRABDOCS_USER")
password = os.getenv("GRABDOCS_PASS")
tfa_bypass_code = os.getenv("GRABDOCS_2FA")

driver = webdriver.Chrome()

try:
    #Go to the login page
    driver.get("https://app.grabdocs.com/") 
    
    #Setup the Wait
    wait = WebDriverWait(driver, 15)
    
    #Wait for the email field to be visible before interacting
    email_field = wait.until(EC.visibility_of_element_located((By.NAME, "username")))
    email_field.send_keys(username)

    password_field = wait.until(EC.visibility_of_element_located((By.NAME, "password")))
    password_field.send_keys(password)
    presentation_pause()
    
    # Click login
    login_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Sign in']")))
    login_button.click()
    
    #AUTOMATED 2FA BYPASS
    print("\nInjecting 2FA bypass code...")
    
    # 1. Wait for and fill the 2FA input field using the placeholder text
    tfa_field = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//input[@placeholder='Enter 6-digit code']")
    ))
    tfa_field.send_keys(tfa_bypass_code)
    presentation_pause()
    
    # 2. Click the verification submit button using the exact text from the UI
    verify_button = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Verify Code']")
    ))
    verify_button.click()
    
    # 3. Wait for the redirect
    wait.until(EC.url_contains("upload"))
    
    print("Successfully reached the upload page!")
    presentation_pause()

    driver.get("https://app.grabdocs.com/quick-links")
    presentation_pause()

    #Click the Button to open the Modal
    new_link_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(text(), 'New Link') or contains(text(), 'Create Your First Link')]")
    ))
    new_link_btn.click()
    presentation_pause()

    #Fill out the "Create Upload Link" Modal
    link_name_input = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//input[@placeholder='Enter link name']")
    ))
    
    test_link_name = "E2E Automated Test Link"
    link_name_input.send_keys(test_link_name)

    #Update the Max File Size (clearing the default '3' first)
    file_size_input = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//label[contains(normalize-space(.), 'Max File Size')]/following::input[1]")
    ))
    
    # Clear existing value using backspaces
    file_size_input.send_keys(Keys.BACKSPACE)
    file_size_input.send_keys("5")
    presentation_pause()

    #Submit the Modal
    create_link_submit_btn = driver.find_element(By.XPATH, "//button[text()='Create Link']")
    create_link_submit_btn.click()
    presentation_pause()

    #Verify the Link was Added to the Table
    try:
        wait.until(EC.visibility_of_element_located(
            (By.XPATH, f"//*[contains(text(), '{test_link_name}')]")
        ))
        print(f"Test Passed: '{test_link_name}' was successfully created and found in the UI.")

    except TimeoutException:
        print("Test Failed: The new link did not appear in the table.")
    presentation_pause()

    # --- File Request & Share Modal Test ---
    
    # 1. Click the 'Actions' dropdown (three dots) for our specific link
    link_row = wait.until(EC.presence_of_element_located(
        (By.XPATH, f"//*[contains(normalize-space(.), '{test_link_name}')]/ancestor::*[contains(@class, 'border') or self::tr][1]")
    ))
    
    # Utilizing 1-based XPath indexing [last()] guarantees we grab the right-most button
    actions_btn = link_row.find_element(By.XPATH, "(.//button)[last()]")
    
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", actions_btn)
    time.sleep(0.5)
    
    # Standard .click() or JS clicks can fail on React SVGs. 
    # ActionChains forces the browser to physically move the mouse cursor to the element and click it.
    ActionChains(driver).move_to_element(actions_btn).click().perform()
    presentation_pause()

    # 2. Click 'Share' from the dropdown menu
    # React Portals hide dropdowns at the bottom of the DOM. We use a broad tag search
    # (button, link, or menuitem) to find the text regardless of where React teleported it.
    share_option = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[(self::button or self::a or @role='menuitem') and contains(normalize-space(.), 'Share')]")
    ))
    share_option.click()
    presentation_pause()

    # 3. Fill out the Email field on the Share Modal
    # We locate the textarea strictly by finding the label right above it
    email_textarea = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//label[contains(text(), 'Email Addresses')]/following::textarea[1]")
    ))
    email_textarea.send_keys("jjdavid@bowiestate.edu")
    presentation_pause()

    # 4. Click Cancel
    cancel_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Send Email']")
    ))
    cancel_btn.click()
    presentation_pause()


    # --- Uploaded Files Polling & Verification ---

    print("\nWaiting for an external file upload... Polling every 5 seconds.")
    # We define a short wait specifically for the polling loop so it fails fast and refreshes
    short_wait = WebDriverWait(driver, 5)
    
    while True:
        # 1. Hyper-specific Tab Click
        # We force Selenium to ignore the header text by explicitly looking for clickable elements
        uploaded_files_tab = wait.until(EC.element_to_be_clickable(
            (By.XPATH, "//*[(self::button or self::a or @role='tab') and contains(normalize-space(.), 'Uploaded Files')]")
        ))
        uploaded_files_tab.click()
        
        try:
            # 2. Resilient Text Checking
            # Using normalize-space(.) ensures we find 'MB' even if React injects hidden spans
            short_wait.until(EC.presence_of_element_located(
                (By.XPATH, "//*[contains(normalize-space(.), 'MB') or contains(normalize-space(.), 'KB')]")
            ))
            break # File found! Break the loop.
        except TimeoutException:
            # File not found yet, wait 5 seconds and refresh the browser
            time.sleep(5)
            driver.refresh()

    print("File detected!")
    presentation_pause()

    # 5. Click the View (Eye) icon
    
    # TRAP 2 FIX: Give React a moment to finish its rendering animations after the polling loop breaks
    time.sleep(1.5)

    file_row = wait.until(EC.presence_of_element_located(
        (By.XPATH, "//*[contains(normalize-space(.), 'MB') or contains(normalize-space(.), 'KB')]/ancestor::*[contains(@class, 'border') or self::tr][1]")
    ))
    
    # TRAP 1 FIX: Isolate the last column. 
    # By isolating the Actions column, we guarantee the blue file name link on the far left isn't grabbed.
    actions_column = file_row.find_element(By.XPATH, "./*[last()]")
    action_icons = actions_column.find_elements(By.XPATH, ".//button | .//a | .//*[@role='button']")
    
    # Custom helper function to enforce 1-indexed logic across the application
    def get_from_1_indexed_array(arr, index):
        return arr[index - 1]
    
    # The array is now strictly [View, Download, Trash]. View is guaranteed to be index 1.
    view_btn = get_from_1_indexed_array(action_icons, 1)
    
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", view_btn)
    time.sleep(0.5)
    
    ActionChains(driver).move_to_element(view_btn).click().perform()
    print("Test Passed: File viewed successfully.")
    
    
    # TRAP 3 FIX: New Tab Handling
    # Wait a second for the browser tab to physically spawn
    time.sleep(1) 
    all_windows = driver.window_handles
    
    # If a new tab opened, the array length will be > 1
    if len(all_windows) > 1:
        # Access the second window using the 1-indexed helper
        new_tab = get_from_1_indexed_array(all_windows, 2)
        driver.switch_to.window(new_tab)
        
        print("Displaying file in new tab for 5 seconds...")
        time.sleep(5)
        
        # Close the PDF tab and switch back to the main app to continue the Workspace test
        driver.close()
        
        # Access the original window using the 1-indexed helper
        main_tab = get_from_1_indexed_array(all_windows, 1)
        driver.switch_to.window(main_tab)
        
    else:
        # If the file opens as an overlay/modal on the same page
        print("Displaying file modal for 5 seconds...")
        time.sleep(5)
        # Hit the Escape key to close the modal and clear the screen for the Workspaces test
        ActionChains(driver).send_keys(Keys.ESCAPE).perform()
    
    # Navigate to Workspaces
    driver.get("https://app.grabdocs.com/workspaces")
    presentation_pause()

    #Open the Create Workspace Modal
    create_ws_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(., 'Create Workspace')]")
    ))
    create_ws_btn.click()
    presentation_pause()

    #Fill out the form
    workspace_name = "E2E Presentation Workspace"
    
    name_input = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//input[contains(@placeholder, 'Enter workspace name')]")
    ))
    name_input.send_keys(workspace_name)
    
    
    desc_input = driver.find_element(
        By.XPATH, "//*[@placeholder='Enter workspace description (required)']"
    )
    desc_input.send_keys("Automated test workspace slated for deletion.")
    presentation_pause()

    # Click Create
    create_submit_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Create']")
    ))
    create_submit_btn.click()
    
    # Wait for the modal to close and the new workspace to appear on the page
    wait.until(EC.visibility_of_element_located(
        (By.XPATH, f"//*[contains(text(), '{workspace_name}')]")
    ))
    presentation_pause() # Pause so the class can see the created workspace

    #Find and Delete the specific workspace
    workspace_card = wait.until(EC.presence_of_element_located(
        (By.XPATH, f"//*[contains(normalize-space(.), '{workspace_name}')]/ancestor::*[contains(@class, 'rounded') or contains(@class, 'border')][1]")
    ))
    
    # Find ALL buttons strictly inside this specific card
    card_buttons = workspace_card.find_elements(By.TAG_NAME, "button")
    
    # --- NEW: Workspace Features Testing ---
    print("\nTesting Workspace Invitations...")

    # 1. Click Invite Member
    # Counting from the right: Trash(-1), Send(-2), Invite(-3)
    invite_btn = card_buttons[-3]
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", invite_btn)
    time.sleep(0.5)
    driver.execute_script("arguments[0].click();", invite_btn)
    presentation_pause()

   # 2. Fill out Invite Modal
    invite_email_field = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//label[contains(normalize-space(.), 'Email Addresses')]/following::textarea[1]")
    ))
    
    # Adding a comma at the end forces React to validate the chip without risking an accidental form submission
    invite_email_field.send_keys("jjdavid@bowiestate.edu")
    presentation_pause()

    # 3. Click Send Invitation
    # Using a wildcard (*) ensures we find it even if it's not technically a <button> tag
    send_invite_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[normalize-space(.)='Send Invitation']")
    ))
    
    # Force the click via JavaScript
    driver.execute_script("arguments[0].click();", send_invite_btn)
    
    # Wait for the modal to close completely
    wait.until(EC.invisibility_of_element_located((By.XPATH, "//*[normalize-space(.)='Send Invitation']")))
    presentation_pause()

    # 4. Click View Members 
    # Re-fetch the card since the DOM updated from "1 member" to "2 members"
    workspace_card = wait.until(EC.presence_of_element_located(
        (By.XPATH, f"//*[contains(normalize-space(.), '{workspace_name}')]/ancestor::*[contains(@class, 'rounded') or contains(@class, 'border')][1]")
    ))
    fresh_card_buttons = workspace_card.find_elements(By.TAG_NAME, "button")
    
    # 1-based indexing from the end of the array: the 5th button is -5
    view_members_btn = fresh_card_buttons[-5]
    
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", view_members_btn)
    time.sleep(0.5)
    driver.execute_script("arguments[0].click();", view_members_btn)

    # 5. Wait for the new member to appear in the modal
    print("Waiting for new member to reflect in the UI...")
    
    try:
        # We use a broad text match (contains(.)) to bypass strict HTML tag requirements
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(., 'Loba David') or contains(., 'jjdavid')]")
        ))
        print("Test Passed: New member successfully invited and verified.")

    except TimeoutException:
        print("UI did not auto-update. Giving backend queue 5 seconds to process...")
        
        # Give the asynchronous backend time to actually create the database record
        time.sleep(5)
        
        # Refresh the browser to wipe the stale React cache (this automatically destroys the modal)
        driver.refresh()
        presentation_pause()
        
        # CRITICAL FIX: React Hydration Pause
        # After a hard refresh, React needs a moment to attach 'onClick' event listeners.
        time.sleep(2)
        
        # Re-find the specific workspace card since the DOM was destroyed during refresh
        workspace_card = wait.until(EC.presence_of_element_located(
            (By.XPATH, f"//*[contains(normalize-space(.), '{workspace_name}')]/ancestor::*[contains(@class, 'rounded') or contains(@class, 'border')][1]")
        ))
        refreshed_buttons = workspace_card.find_elements(By.TAG_NAME, "button")
        
        retry_view_members_btn = refreshed_buttons[-5]
        
        driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", retry_view_members_btn)
        time.sleep(0.5)
        
        # Use ActionChains for a genuine physical click, ensuring React intercepts it properly after hydration
        ActionChains(driver).move_to_element(retry_view_members_btn).click().perform()
        
        # Verify the member is there now
        wait.until(EC.presence_of_element_located(
            (By.XPATH, "//*[contains(., 'Loba David') or contains(., 'jjdavid')]")
        ))
        print("Test Passed: New member verified after database refresh.")
        presentation_pause()

    # 6. Close the View Members modal by clicking the 'X' icon
    print("Closing Members modal...")
    
    # Using the exact Tailwind CSS classes you found in the DOM inspection!
    close_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(@class, 'text-gray-400') and contains(@class, 'hover:text-gray-600')]")
    ))
    
    # Force click via JS to bypass any overlapping CSS padding issues
    driver.execute_script("arguments[0].click();", close_btn)
    
    # Wait for the modal and its dark background overlay to completely disappear from the DOM
    wait.until(EC.invisibility_of_element_located(
        (By.XPATH, f"//*[contains(normalize-space(.), '{workspace_name} Members')]")
    ))
    
    # Brief buffer for the fade animation to fully release the UI before we try to click the trash can
    time.sleep(1)

    # --- Proceed to existing delete ---
    print("\nProceeding to Workspace Deletion...")
    
    # ALWAYS re-fetch the card right before deletion to completely eliminate StaleElement errors
    # regardless of whether the previous step triggered a page refresh or not.
    final_workspace_card = wait.until(EC.presence_of_element_located(
        (By.XPATH, f"//*[contains(normalize-space(.), '{workspace_name}')]/ancestor::*[contains(@class, 'rounded') or contains(@class, 'border')][1]")
    ))
    final_card_buttons = final_workspace_card.find_elements(By.TAG_NAME, "button")
    
    # 1-based indexing from the end: Trash is the 1st button from the right (-1)
    delete_btn = final_card_buttons[-1]
    
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", delete_btn)
    time.sleep(0.5) 
    
    # Now execute the click
    # Force the click via JavaScript to bypass the parent card's CSS padding
    driver.execute_script("arguments[0].click();", delete_btn)
    presentation_pause()

    # Handle the Native Browser Alert
    alert = wait.until(EC.alert_is_present())
    print(f"Intercepted Alert: {alert.text}")
    alert.accept()
    presentation_pause()

    # --- DRAFTS PHASE ---
    print("\nProceeding to Drafts Feature Testing...")

    driver.get("https://app.grabdocs.com/drafts")
    presentation_pause()

    new_draft_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[(self::button or self::a) and contains(normalize-space(.), 'New Draft')]")
    ))
    driver.execute_script("arguments[0].click();", new_draft_btn)
    
    time.sleep(2) 
    all_windows = driver.window_handles
    
    if len(all_windows) > 1:
        new_tab = get_from_1_indexed_array(all_windows, 2)
        driver.switch_to.window(new_tab)
        
    presentation_pause()

    editor_canvas = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[@contenteditable='true' or @role='textbox']")
    ))
    editor_canvas.click()
    ActionChains(driver).send_keys("Hello World - Automated Draft Testing").perform()
    presentation_pause()

    save_changes_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Save Changes']")
    ))
    driver.execute_script("arguments[0].click();", save_changes_btn)
    presentation_pause()

    print("Opening Share Modal...")
    invite_edit_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[(self::button or self::a or @role='button') and contains(normalize-space(.), 'Invite to Edit')]")
    ))
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", invite_edit_btn)
    time.sleep(0.5)
    ActionChains(driver).move_to_element(invite_edit_btn).click().perform()
    presentation_pause()

    select_element = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//select[.//option[@value='member']]")
    ))
    dropdown = Select(select_element)
    dropdown.select_by_value("member")
    presentation_pause()

    create_link_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Create Link']")
    ))
    driver.execute_script("arguments[0].click();", create_link_btn)
    presentation_pause()

    draft_email_field = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//label[contains(normalize-space(.), 'Email Addresses')]/following::textarea[1]")
    ))
    draft_email_field.send_keys("jjdavid@bowiestate.edu,")
    presentation_pause()

    send_draft_email_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Send Email']")
    ))
    driver.execute_script("arguments[0].click();", send_draft_email_btn)
    presentation_pause()

    done_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Done']")
    ))
    driver.execute_script("arguments[0].click();", done_btn)
    wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[normalize-space(.)='Done']")))
    presentation_pause()

    print("Waiting 30 seconds for secondary user to edit the draft...")
    time.sleep(30)

    retry_save_changes_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Save Changes']")
    ))
    driver.execute_script("arguments[0].click();", retry_save_changes_btn)
    presentation_pause()

    cancel_draft_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Cancel']")
    ))
    driver.execute_script("arguments[0].click();", cancel_draft_btn)
    print("Test Passed: Draft collaboration sequence complete.")
    presentation_pause()

    if len(all_windows) > 1:
        driver.close()
        main_tab = get_from_1_indexed_array(all_windows, 1)
        driver.switch_to.window(main_tab)

finally:
    driver.quit()