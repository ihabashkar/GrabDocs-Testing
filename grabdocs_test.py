import os
import time
from dotenv import load_dotenv
from selenium import webdriver
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys

# Load the variables from .env into the environment
load_dotenv()

PRESENTER_MODE = True  
PAUSE_DURATION = 5

def presentation_pause():
    if PRESENTER_MODE:
        time.sleep(PAUSE_DURATION)

# Access the variables
username = os.getenv("GRABDOCS_USER")
password = os.getenv("GRABDOCS_PASS")

driver = webdriver.Chrome()

try:
    #Go to the login page
    driver.get("https://app.grabdocs.com/") 
    
    #Setup the Wait
    wait = WebDriverWait(driver, 15)
    
    #Wait for the email field to be visible, then interact
    email_field = wait.until(EC.visibility_of_element_located((By.NAME, "username")))
    email_field.send_keys(username)

    
    # Do the same for password
    password_field = wait.until(EC.visibility_of_element_located((By.NAME, "password")))
    password_field.send_keys(password)
    presentation_pause()
    
    # Click login
    login_button = wait.until(EC.element_to_be_clickable((By.XPATH, "//button[text()='Sign in']")))
    login_button.click()
    
    
    print("\n[ACTION REQUIRED] Please enter the 2FA code in the Chrome window.")
    
    # We increase the wait time specifically for this step
    long_wait = WebDriverWait(driver, 60)
    long_wait.until(EC.url_contains("upload"))
    presentation_pause()
    
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
    file_size_input = driver.find_element(
        By.XPATH, "//label[contains(text(), 'Max File Size')]/following-sibling::div//input | //input[@value='3']"
    )
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

    # Navigate to Workspaces
    driver.get("https://app.grabdocs.com/workspaces")
    presentation_pause()

    # 2. Open the Create Workspace Modal
    create_ws_btn = wait.until(EC.element_to_be_clickable(
        (By.XPATH, "//button[contains(., 'Create Workspace')]")
    ))
    create_ws_btn.click()
    presentation_pause()

    # 3. Fill out the form
    workspace_name = "E2E Presentation Workspace"
    
    name_input = wait.until(EC.visibility_of_element_located(
        (By.XPATH, "//input[contains(@placeholder, 'Enter workspace name')]")
    ))
    name_input.send_keys(workspace_name)
    
    # Using a wildcard `*` here because descriptions are sometimes <textarea> instead of <input>
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

    # 4. Find and Delete the specific workspace
    
    # Step A: Isolate the specific card containing our workspace name
    # Using normalize-space(.) handles any weird React text-wrapping
    workspace_card = wait.until(EC.presence_of_element_located(
        (By.XPATH, f"//*[contains(normalize-space(.), '{workspace_name}')]/ancestor::*[contains(@class, 'rounded') or contains(@class, 'border')][1]")
    ))
    
    # Step B: Find ALL buttons strictly inside this specific card
    card_buttons = workspace_card.find_elements(By.TAG_NAME, "button")
    
    # Step C: The trash icon is the right-most button, making it the last item in our list.
    # Python's negative indexing [-1] easily grabs the last element.
    delete_btn = card_buttons[-1]
    
    # Step D: The "Scroll Into View" trick
    # This forces the browser to center the button on the screen, guaranteeing 
    # no other UI elements (like sticky nav bars) intercept the click.
    driver.execute_script("arguments[0].scrollIntoView({block: 'center'});", delete_btn)
    time.sleep(0.5) # Brief pause to allow the scroll animation to finish
    
    # Now execute the click
    delete_btn.click()
    presentation_pause() # Pause so the class sees the native browser alert pop up

    # 5. Handle the Native Browser Alert
    alert = wait.until(EC.alert_is_present())
    print(f"Intercepted Alert: {alert.text}")
    alert.accept() 
    
    # 6. Verify Deletion
    wait.until(EC.invisibility_of_element_located(
        (By.XPATH, f"//*[contains(normalize-space(.), '{workspace_name}')]")
    ))
    print(f"Test Passed: '{workspace_name}' was successfully created and deleted.")
    presentation_pause()
finally:
    driver.quit()