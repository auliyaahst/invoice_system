-- First create a function for updating timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = CURRENT_TIMESTAMP;
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Create Products table
CREATE TABLE Products (
    ProductID SERIAL PRIMARY KEY,
    ProductName VARCHAR(100) NOT NULL,
    Description TEXT,
    Price DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Discounts table
CREATE TABLE Discounts (
    DiscountID SERIAL PRIMARY KEY,
    DiscountName VARCHAR(50) NOT NULL UNIQUE,
    DiscountValue DECIMAL(5,2) NOT NULL,
    ValidFrom TIMESTAMP NOT NULL,
    ValidUntil TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Customers table
CREATE TABLE Customers (
    CustomerID SERIAL PRIMARY KEY,
    Name VARCHAR(100) NOT NULL,
    Email VARCHAR(100),
    Phone VARCHAR(15),
    Address VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create BankDetails table
CREATE TABLE BankDetails (
    BankDetailID SERIAL PRIMARY KEY,
    BankName VARCHAR(100) NOT NULL,
    AccountNumber VARCHAR(50) NOT NULL,
    IBAN VARCHAR(50) NOT NULL,
    BIC VARCHAR(20) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create PaymentStatus table
CREATE TABLE PaymentStatus (
    StatusID SERIAL PRIMARY KEY,
    StatusName VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create PaymentMethods table
CREATE TABLE PaymentMethods (
    MethodID SERIAL PRIMARY KEY,
    MethodName VARCHAR(50) NOT NULL UNIQUE,
    Description VARCHAR(255),
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Taxrates table
CREATE TABLE Taxrates (
    TaxID SERIAL PRIMARY KEY,
    TaxName VARCHAR(50) NOT NULL UNIQUE,
    Rate DECIMAL(5,2) NOT NULL,
    ValidFrom TIMESTAMP NOT NULL,
    ValidUntil TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Create Invoices table
CREATE TABLE Invoices (
    InvoiceID SERIAL PRIMARY KEY,
    CustomerID INTEGER NOT NULL,
    InvoiceDate TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    DueDate TIMESTAMP NOT NULL,
    TotalAmount DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (CustomerID) REFERENCES Customers(CustomerID)
);

-- Create InvoiceDetails table
CREATE TABLE InvoiceDetails (
    DetailedID SERIAL PRIMARY KEY,
    InvoiceID INTEGER NOT NULL,
    ProductID INTEGER NOT NULL,
    Quantity INTEGER NOT NULL,
    TaxID INTEGER NOT NULL,
    DiscountID INTEGER,
    LineTotal DECIMAL(10,2) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID),
    FOREIGN KEY (ProductID) REFERENCES Products(ProductID),
    FOREIGN KEY (TaxID) REFERENCES Taxrates(TaxID),
    FOREIGN KEY (DiscountID) REFERENCES Discounts(DiscountID)
);

-- Create Payments table
CREATE TABLE Payments (
    PaymentID SERIAL PRIMARY KEY,
    InvoiceID INTEGER NOT NULL,
    PaymentAmount DECIMAL(10,2) NOT NULL,
    PaymentDate TIMESTAMP NOT NULL,
    PaymentMethodID INTEGER NOT NULL,
    StatusID INTEGER NOT NULL,
    PaymentReference VARCHAR(255),
    ProcessedAt TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID),
    FOREIGN KEY (PaymentMethodID) REFERENCES PaymentMethods(MethodID),
    FOREIGN KEY (StatusID) REFERENCES PaymentStatus(StatusID)
);

-- Create PaymentLogs table
CREATE TABLE PaymentLogs (
    LogID SERIAL PRIMARY KEY,
    PaymentID INTEGER NOT NULL,
    Timestamp TIMESTAMP NOT NULL,
    LogMessage VARCHAR(255) NOT NULL,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (PaymentID) REFERENCES Payments(PaymentID)
);

-- Create ShippingDetails table
CREATE TABLE ShippingDetails (
    ShippingID SERIAL PRIMARY KEY,
    InvoiceID INTEGER NOT NULL,
    Address VARCHAR(255) NOT NULL,
    ShippingDate TIMESTAMP NOT NULL,
    EstimatedArrival TIMESTAMP NOT NULL,
    ActualDelivery TIMESTAMP,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (InvoiceID) REFERENCES Invoices(InvoiceID)
);

-- Create triggers for updating updated_at columns
CREATE TRIGGER update_products_updated_at BEFORE UPDATE
    ON Products FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_discounts_updated_at BEFORE UPDATE
    ON Discounts FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_customers_updated_at BEFORE UPDATE
    ON Customers FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_bankdetails_updated_at BEFORE UPDATE
    ON BankDetails FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_paymentstatus_updated_at BEFORE UPDATE
    ON PaymentStatus FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_paymentmethods_updated_at BEFORE UPDATE
    ON PaymentMethods FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_taxrates_updated_at BEFORE UPDATE
    ON Taxrates FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoices_updated_at BEFORE UPDATE
    ON Invoices FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_invoicedetails_updated_at BEFORE UPDATE
    ON InvoiceDetails FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_payments_updated_at BEFORE UPDATE
    ON Payments FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

CREATE TRIGGER update_shippingdetails_updated_at BEFORE UPDATE
    ON ShippingDetails FOR EACH ROW EXECUTE PROCEDURE update_updated_at_column();

-- Insert initial payment status values
INSERT INTO PaymentStatus (StatusName, Description) VALUES
    ('Pending', 'Payment is pending processing'),
    ('Completed', 'Payment has been processed successfully'),
    ('Failed', 'Payment processing failed'),
    ('Refunded', 'Payment has been refunded');

-- Insert initial payment methods
INSERT INTO PaymentMethods (MethodName, Description) VALUES
    ('Credit Card', 'Payment by credit card'),
    ('Bank Transfer', 'Direct bank transfer payment'),
    ('Cash', 'Cash payment'),
    ('PayPal', 'Payment through PayPal');