# mct10_automation.py
# Automates Danfoss MCT-10 software: Import Excel -> Save as SSP
# Compatible with n8n Execute Command node

import sys
import os
import time
import io
import json

# Set UTF-8 encoding for Windows console
sys.stdout = io.TextIOWrapper(sys.stdout.buffer, encoding='utf-8', errors='replace')
sys.stderr = io.TextIOWrapper(sys.stderr.buffer, encoding='utf-8', errors='replace')

try:
    from pywinauto import Application, Desktop
    from pywinauto.keyboard import send_keys
    import pywinauto.findwindows as findwindows
except ImportError:
    print(json.dumps({"error": "pywinauto not installed. Run: pip install pywinauto"}))
    sys.exit(1)

def automate_mct10(excel_path, output_dir):
    """
    Automates MCT-10 software: Tools -> Import from Excel -> Save as SSP
    """
    try:
        print(json.dumps({"status": "starting", "message": "Starting MCT-10 automation"}))
        print(json.dumps({"excel_path": excel_path, "output_dir": output_dir}))
        
        # Verify Excel file exists
        if not os.path.exists(excel_path):
            raise Exception(f"Excel file not found: {excel_path}")
        
        print(json.dumps({"status": "info", "message": f"Excel file found: {excel_path}"}))
        
        # MCT-10 executable path
        mct10_exe = r"C:\Program Files (x86)\Danfoss Drives\VLT Motion Control Tool\MCT 10 Set-up Software\MCT 10 Set-up Software.exe"
        
        if not os.path.exists(mct10_exe):
            raise Exception(f"MCT-10 software not found at: {mct10_exe}")
        
        print(json.dumps({"status": "info", "message": f"Found MCT-10 at: {mct10_exe}"}))
        
        # Start MCT-10 application
        print(json.dumps({"status": "starting_app", "message": "Starting MCT-10 application..."}))
        app = Application(backend="uia").start(mct10_exe)
        time.sleep(8)  # Wait for application to fully load
        
        # List all windows to debug
        print(json.dumps({"status": "detecting", "message": "Detecting windows..."}))
        desktop = Desktop(backend="uia")
        all_windows = desktop.windows()
        
        window_titles = []
        for win in all_windows:
            try:
                title = win.window_text()
                if title:
                    window_titles.append(title)
            except:
                pass
        
        print(json.dumps({"status": "windows_found", "count": len(all_windows), "titles": window_titles}))
        
        # Try to connect to MCT-10 window by process ID
        print(json.dumps({"status": "connecting", "message": f"Connecting to MCT-10 (Process ID: {app.process})"}))
        
        # Get all windows from the application
        try:
            # Method 1: Connect by process
            app_windows = app.windows()
            if not app_windows:
                raise Exception("No windows found for MCT-10 process")
            
            # Find the main window (usually the first or largest)
            main_window = None
            for window in app_windows:
                try:
                    if window.is_visible():
                        main_window = window
                        print(json.dumps({"status": "window_found", "title": window.window_text()}))
                        break
                except:
                    continue
            
            if not main_window:
                main_window = app_windows[0]
                print(json.dumps({"status": "using_first_window", "title": main_window.window_text()}))
            
        except Exception as e:
            print(json.dumps({"status": "error", "message": f"Error connecting to window: {str(e)}"}))
            raise Exception("Could not connect to MCT-10 main window")
        
        # Focus the window
        main_window.set_focus()
        time.sleep(2)
        print(json.dumps({"status": "focused", "message": "MCT-10 window focused"}))
        
        # Navigate to Tools -> Import from Excel
        print(json.dumps({"status": "menu", "message": "Opening Tools menu (Alt+T)"}))
        send_keys('%t')  # Alt+T for Tools menu
        time.sleep(2)
        
        # Look for Import from Excel option
        print(json.dumps({"status": "import", "message": "Selecting 'Import drives from Excel'"}))
        send_keys('m')  # Usually 'I' for Import
        time.sleep(3)
        
        # A file dialog should open - wait for it
        print(json.dumps({"status": "waiting_dialog", "message": "Waiting for file dialog..."}))
        time.sleep(2)
        
        # Type the Excel path with Ctrl+A to clear any existing text
        print(json.dumps({"status": "file_path", "message": f"Typing Excel file path: {excel_path}"}))
        send_keys('^a')  # Ctrl+A to select all
        time.sleep(0.5)
        send_keys(excel_path, pause=0.05)
        time.sleep(2)
        
        # Press Enter to import
        print(json.dumps({"status": "importing", "message": "Pressing Enter to import..."}))
        send_keys('{ENTER}')
        time.sleep(10)  # Wait longer for import to complete
        
        print(json.dumps({"status": "imported", "message": "Excel file imported successfully"}))
        
        # Now save the project as SSP - use File menu instead
        print(json.dumps({"status": "saving", "message": "Opening File menu for Save As..."}))
        send_keys('%f')  # Alt+F for File menu
        time.sleep(2)
        send_keys('a')  # Save As
        time.sleep(3)
        
        # Generate SSP filename
        excel_filename = os.path.basename(excel_path)
        base_name = os.path.splitext(excel_filename)[0]
        ssp_filename = f"{base_name}.ssp"
        ssp_path = os.path.join(output_dir, ssp_filename)
        
        # Clear any existing filename and type the save path
        print(json.dumps({"status": "save_path", "message": f"Typing SSP save path: {ssp_path}"}))
        send_keys('^a')  # Ctrl+A to select filename field
        time.sleep(0.5)
        send_keys(ssp_path, pause=0.05)
        time.sleep(2)
        
        # Tab to file type dropdown
        print(json.dumps({"status": "file_type", "message": "Setting file type to SSP"}))
        send_keys('{TAB}')
        time.sleep(1)
        send_keys('{DOWN}')  # Move down in dropdown
        time.sleep(0.5)
        send_keys('{DOWN}')  # Try to find SSP format
        time.sleep(0.5)
        
        # Press Enter to save
        print(json.dumps({"status": "saving_file", "message": "Pressing Enter to save..."}))
        send_keys('{ENTER}')
        time.sleep(5)
        
        # Handle overwrite confirmation if exists
        print(json.dumps({"status": "checking_overwrite", "message": "Checking for overwrite dialog..."}))
        time.sleep(2)
        send_keys('{ENTER}')  # Press Enter in case of overwrite dialog
        time.sleep(2)
        
        print(json.dumps({"status": "saved", "message": f"SSP file should be saved to: {ssp_path}"}))
        
        # Wait a bit before closing to ensure file is written
        time.sleep(3)
        
        # Close MCT-10
        print(json.dumps({"status": "closing", "message": "Closing MCT-10..."}))
        send_keys('%{F4}')  # Alt+F4
        time.sleep(2)
        
        # Handle "Save changes?" dialog if appears
        print(json.dumps({"status": "checking_save_dialog", "message": "Checking for save changes dialog..."}))
        time.sleep(1)
        send_keys('n')  # No, don't save changes (already saved)
        time.sleep(2)
        
        # Verify SSP file was created - check longer
        print(json.dumps({"status": "verifying", "message": "Verifying SSP file creation..."}))
        for i in range(15):  # Check for 15 seconds
            if os.path.exists(ssp_path):
                file_size = os.path.getsize(ssp_path)
                result = {
                    "status": "success",
                    "message": "SSP file created successfully",
                    "ssp_path": ssp_path,
                    "file_size": file_size
                }
                print(json.dumps(result))
                return ssp_path
            print(json.dumps({"status": "waiting", "message": f"Attempt {i+1}/15 - File not found yet"}))
            time.sleep(1)
        
        # File not found
        raise Exception(f"SSP file not created at: {ssp_path}")
        
    except Exception as e:
        error_msg = str(e)
        print(json.dumps({"status": "error", "message": error_msg}))
        
        # Try to close any open MCT-10 windows
        try:
            send_keys('%{F4}')
            time.sleep(1)
            send_keys('n')  # Don't save
            time.sleep(1)
        except:
            pass
        
        raise Exception(error_msg)

if __name__ == "__main__":
    # Default paths for OutputFileVFD
    default_excel_path = r"C:\Users\U439310\OneDrive - Danfoss\Shared Folders\Danfoss\ALADIN\OutputFileVFD.xlsx"
    default_output_dir = r"C:\Users\U439310\OneDrive - Danfoss\Shared Folders\Danfoss\ALADIN"
    
    # Check if arguments provided (for command line usage)
    if len(sys.argv) >= 3:
        excel_path = sys.argv[1]
        output_dir = sys.argv[2]
    elif len(sys.argv) == 2:
        # Only Excel path provided, use default output dir
        excel_path = sys.argv[1]
        output_dir = default_output_dir
    else:
        # No arguments, use defaults (for n8n Execute Command)
        excel_path = default_excel_path
        output_dir = default_output_dir
    
    try:
        result = automate_mct10(excel_path, output_dir)
        # Output final result as JSON for n8n
        print(json.dumps({
            "success": True,
            "ssp_file": result,
            "excel_file": excel_path,
            "output_directory": output_dir
        }))
    except Exception as e:
        # Output error as JSON for n8n
        print(json.dumps({
            "success": False,
            "error": str(e),
            "excel_file": excel_path,
            "output_directory": output_dir
        }))
        sys.exit(1)
