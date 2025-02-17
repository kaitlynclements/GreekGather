"""
 * Name: App.test.js
 * Description: Test file used for authentication, database setup, login and registering functionalities, and adding calendar
 * Programmer: Kaitlyn Clements, Taylor Slade, Lizzie Soltis, Aaditi Chinawalkar, Sam Muehlebach
 * Created: February 2nd, 2025
 * Revised: Refer to Github commits.
 * Revisions: Refer to Github commits.
 * Preconditions: Flask and dependencies must be installed.
 * Acceptable Inputs: HTTP requests to intended endpoints.
 * Unacceptable Inputs: Incorrect requests.
 * Postconditions: Routes are registered and server starts.
 * Return Values: N/A
 * Errors & Exceptions: Raises errors if database is not connected.
 * Side Effects: Flask app initialized
 * Invariants: Server must remain available.
 * Known Faults: N/A
"""
import { render, screen } from '@testing-library/react';
import App from './App';

test('renders learn react link', () => {
  render(<App />);
  const linkElement = screen.getByText(/learn react/i);
  expect(linkElement).toBeInTheDocument();
});
