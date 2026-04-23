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

# Custom helper function to enforce 1-indexed logic across the application
def get_from_1_indexed_array(arr, index):
    return arr[index - 1]

# Access the variables
username = os.getenv("GRABDOCS_USER")
password = os.getenv("GRABDOCS_PASS")
tfa_bypass_code = os.getenv("GRABDOCS_2FA")

driver = webdriver.Chrome()

try:
    # --- AUTHENTICATION PHASE (Required to access the app) ---
    driver.get("https://app.grabdocs.com/") 
    wait = WebDriverWait(driver, 15)
    
    email_field = wait.until(EC.visibility_of_element_located((By.NAME, "username")))
    email_field.send_keys(username)
    password_field = wait.until(EC.visibility_of_element_located((By.NAME, "password")))
    password_field.send_keys(password)
    
    login_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Sign in']")))
    login_button.click()
    
    print("Injecting 2FA bypass code...")
    tfa_field = wait.until(EC.visibility_of_element_located((By.XPATH, "//input[@placeholder='Enter 6-digit code']")))
    tfa_field.send_keys(tfa_bypass_code)
    
    verify_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[normalize-space(.)='Verify Code']")))
    verify_button.click()
    
    wait.until(EC.url_contains("upload"))
    print("Authentication successful!")


    # --- ISOLATED DRAFTS FEATURE TESTING ---
    print("\nProceeding to Drafts Feature Testing...")

    # Navigate directly to the Drafts page
    driver.get("https://app.grabdocs.com/drafts")
    presentation_pause()

    # Click the 'New Draft' button
    new_draft_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[(self::button or self::a) and contains(normalize-space(.), 'New Draft')]")
    ))
    driver.execute_script("arguments[0].click();", new_draft_btn)
    
    # Wait for the new pop-up window/tab to spawn
    time.sleep(2) 
    all_windows = driver.window_handles
    
    # Switch focus to the new Draft window using your 1-indexed helper
    if len(all_windows) > 1:
        new_tab = get_from_1_indexed_array(all_windows, 2)
        driver.switch_to.window(new_tab)
        
    presentation_pause()

    # 1. Type on the blank page
    # Rich text editors typically use contenteditable divs. We target it directly.
    editor_canvas = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[@contenteditable='true' or @role='textbox']")
    ))
    editor_canvas.click()
    
    # We use ActionChains to ensure the keystrokes register naturally in the React editor
    ActionChains(driver).send_keys("Hello World - Automated Draft Testing").perform()
    presentation_pause()

    # 2. Click Save Changes
    save_changes_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Save Changes']")
    ))
    driver.execute_script("arguments[0].click();", save_changes_btn)
    presentation_pause()

    # 3. Click Invite to Edit
    print("Opening Share Modal...")
    
    # Restrict the search strictly to interactive tags to avoid clicking dead inner spans
    invite_edit_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//*[(self::button or self::a or @role='button') and contains(normalize-space(.), 'Invite to Edit')]")
    ))
    
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", invite_edit_btn)
    time.sleep(0.5)
    
    # Use ActionChains for a genuine physical mouse click. This is crucial because we 
    # need to force the browser to pull its focus out of the rich text canvas.
    ActionChains(driver).move_to_element(invite_edit_btn).click().perform()
    presentation_pause()

    # 4. Change Access Role Dropdown to 'Member'
    # The inspector reveals this is a native HTML <select> tag, so we use Selenium's built-in Select helper!
    
    # Target the <select> element that contains our specific options
    select_element = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//select[.//option[@value='member']]")
    ))
    
    # Instantiate the Select class
    dropdown = Select(select_element)
    
    # Select the option using the exact 'value' attribute you found in the DOM screenshot!
    dropdown.select_by_value("member")
    presentation_pause()

    # 5. Click Create Link
    create_link_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Create Link']")
    ))
    driver.execute_script("arguments[0].click();", create_link_btn)
    presentation_pause()

    # 6. Fill out Email Addresses on the next modal
    draft_email_field = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//label[contains(normalize-space(.), 'Email Addresses')]/following::textarea[1]")
    ))
    
    # Use the comma trick to force React to validate the email "chip"
    draft_email_field.send_keys("jjdavid@bowiestate.edu,")
    presentation_pause()

    # 7. Click Send Email
    send_draft_email_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Send Email']")
    ))
    driver.execute_script("arguments[0].click();", send_draft_email_btn)
    presentation_pause()

    # 8. Click Done
    done_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Done']")
    ))
    driver.execute_script("arguments[0].click();", done_btn)
    
    # Wait for the Share modal to completely close
    wait.until(EC.invisibility_of_element_located((By.XPATH, "//button[normalize-space(.)='Done']")))
    presentation_pause()

    # 9. Wait 15 seconds for the other user
    print("Waiting 15 seconds for secondary user to edit the draft...")
    time.sleep(15)

    # 10. Click Save Changes again
    # Re-fetch the button in case the DOM updated during the 15-second wait
    retry_save_changes_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Save Changes']")
    ))
    driver.execute_script("arguments[0].click();", retry_save_changes_btn)
    presentation_pause()

    # 11. Click Cancel
    cancel_draft_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[normalize-space(.)='Cancel']")
    ))
    driver.execute_script("arguments[0].click();", cancel_draft_btn)
    print("Test Passed: Draft collaboration sequence complete.")
    presentation_pause()

    # Clean up: Close the Draft tab and return to the main GrabDocs tab
    if len(all_windows) > 1:
        driver.close()
        main_tab = get_from_1_indexed_array(all_windows, 1)
        driver.switch_to.window(main_tab)

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
    draft_email_field.send_keys("jjdavid@bowiestate.edu")
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
    # This ensures Chrome closes gracefully when the script finishes or if it crashes
    driver.quit()