-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- ============================================
-- 0. CLEANUP (For development: ensures fresh state)
-- ============================================
DROP TABLE IF EXISTS invoice_items CASCADE;
DROP TABLE IF EXISTS invoices CASCADE;
DROP SEQUENCE IF EXISTS invoice_number_seq;

DROP FUNCTION IF EXISTS create_invoice(jsonb, numeric, numeric);
DROP FUNCTION IF EXISTS get_invoice_with_items(uuid);
DROP FUNCTION IF EXISTS add_invoice_item(uuid, text, numeric, numeric, numeric, numeric);
DROP FUNCTION IF EXISTS update_invoice(uuid, jsonb, numeric, numeric);
DROP FUNCTION IF EXISTS delete_invoice_item(uuid);
DROP FUNCTION IF EXISTS list_invoices(integer, integer);

DROP FUNCTION IF EXISTS create_invoice(jsonb, numeric, numeric);
DROP FUNCTION IF EXISTS get_invoice_with_items(uuid);
DROP FUNCTION IF EXISTS add_invoice_item(uuid, text, numeric, numeric, numeric, numeric);
DROP FUNCTION IF EXISTS update_invoice(uuid, jsonb, numeric, numeric);
DROP FUNCTION IF EXISTS delete_invoice_item(uuid);
DROP FUNCTION IF EXISTS list_invoices(integer, integer);

-- ============================================
-- 1. TABLES & SEQUENCES
-- ============================================

-- Sequence for automatic invoice numbering (e.g. #DV-2024-00001)
CREATE SEQUENCE IF NOT EXISTS invoice_number_seq START 1;

-- Invoices Table
CREATE TABLE IF NOT EXISTS invoices (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    reference VARCHAR(20) UNIQUE NOT NULL, -- Format: DV-YYYY-NNNNN
    
    -- Client Info stored as JSONB to match frontend interface { name, address, phone }
    client_info JSONB NOT NULL DEFAULT '{}'::jsonb,
    
    -- Global modifiers
    global_tax_rate DECIMAL(5, 2) DEFAULT 0,
    global_discount_rate DECIMAL(5, 2) DEFAULT 0,
    
    -- Totals (Calculated)
    total_ht DECIMAL(15, 2) DEFAULT 0,
    total_tax DECIMAL(15, 2) DEFAULT 0,
    total_discount DECIMAL(15, 2) DEFAULT 0,
    total_ttc DECIMAL(15, 2) DEFAULT 0,
    
    status VARCHAR(50) DEFAULT 'draft', -- draft, sent, paid, cancelled
    
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Invoice Items Table
CREATE TABLE IF NOT EXISTS invoice_items (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    invoice_id UUID NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
    
    description TEXT NOT NULL,
    quantity DECIMAL(10, 2) NOT NULL DEFAULT 1,
    unit_price DECIMAL(15, 2) NOT NULL DEFAULT 0,
    
    -- Item-level modifiers
    tax_rate DECIMAL(5, 2) DEFAULT 0,
    discount_rate DECIMAL(5, 2) DEFAULT 0,
    
    position INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Indices
CREATE INDEX IF NOT EXISTS idx_invoices_reference ON invoices(reference);
CREATE INDEX IF NOT EXISTS idx_invoice_items_invoice_id ON invoice_items(invoice_id);

-- ============================================
-- 2. UTILITY FUNCTIONS
-- ============================================

-- Function to generate invoice number: DV-2025-00001
CREATE OR REPLACE FUNCTION generate_invoice_reference()
RETURNS VARCHAR(20) AS $$
DECLARE
    year_part VARCHAR(4);
    seq_part INTEGER;
BEGIN
    year_part := TO_CHAR(CURRENT_DATE, 'YYYY');
    seq_part := nextval('invoice_number_seq');
    RETURN 'DV-' || year_part || '-' || LPAD(seq_part::TEXT, 5, '0');
END;
$$ LANGUAGE plpgsql;

-- Function to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

-- Trigger for invoices
DROP TRIGGER IF EXISTS update_invoices_updated_at ON invoices;
CREATE TRIGGER update_invoices_updated_at
    BEFORE UPDATE ON invoices
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at_column();

-- ============================================
-- 3. STORED PROCEDURES (API LAYER)
-- ============================================

-- Procedure: Create a new invoice
CREATE OR REPLACE FUNCTION create_invoice(
    p_client_info JSONB DEFAULT '{}'::jsonb,
    p_global_tax DECIMAL DEFAULT 0,
    p_global_discount DECIMAL DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    reference VARCHAR,
    client_info JSONB,
    global_tax_rate DECIMAL,
    global_discount_rate DECIMAL,
    status VARCHAR,
    created_at TIMESTAMP WITH TIME ZONE,
    updated_at TIMESTAMP WITH TIME ZONE
) AS $$
BEGIN
    RETURN QUERY
    INSERT INTO invoices (reference, client_info, global_tax_rate, global_discount_rate)
    VALUES (generate_invoice_reference(), p_client_info, p_global_tax, p_global_discount)
    RETURNING 
        invoices.id, 
        invoices.reference, 
        invoices.client_info, 
        invoices.global_tax_rate, 
        invoices.global_discount_rate, 
        invoices.status, 
        invoices.created_at, 
        invoices.updated_at;
END;
$$ LANGUAGE plpgsql;

-- ============================================
-- 4. CALCULATION LOGIC (Explicit Procedure)
-- ============================================

DROP TRIGGER IF EXISTS trigger_recalc_totals_items ON invoice_items;
DROP FUNCTION IF EXISTS recalculate_invoice_totals();

CREATE OR REPLACE FUNCTION perform_invoice_calculation(p_invoice_id UUID)
RETURNS VOID AS $$
DECLARE
    -- Accumulators
    v_subtotal_ht DECIMAL := 0;
    v_items_discount DECIMAL := 0;
    v_items_tax DECIMAL := 0;
    
    -- Global Modifiers
    v_global_tax_rate DECIMAL;
    v_global_discount_rate DECIMAL;
    
    -- Final Results
    v_global_discount_amount DECIMAL;
    v_global_tax_amount DECIMAL;
    v_after_items_discount DECIMAL;
    v_after_all_discounts DECIMAL;
    
    v_final_tax DECIMAL;
    v_final_discount DECIMAL;
    v_final_total DECIMAL;
BEGIN
    -- 1. Aggregate Items
    SELECT COALESCE(SUM(quantity * unit_price), 0) INTO v_subtotal_ht FROM invoice_items WHERE invoice_id = p_invoice_id;
    
    SELECT COALESCE(SUM((quantity * unit_price) * (discount_rate / 100)), 0) INTO v_items_discount FROM invoice_items WHERE invoice_id = p_invoice_id;
    SELECT COALESCE(SUM( ((quantity * unit_price) - ((quantity * unit_price) * (discount_rate / 100))) * (tax_rate / 100) ), 0) INTO v_items_tax FROM invoice_items WHERE invoice_id = p_invoice_id;

    -- 2. Get Global Rates
    SELECT global_tax_rate, global_discount_rate 
    INTO v_global_tax_rate, v_global_discount_rate 
    FROM invoices 
    WHERE id = p_invoice_id;

    -- 3. Apply Global Logic
    v_after_items_discount := v_subtotal_ht - v_items_discount;
    v_global_discount_amount := v_after_items_discount * (v_global_discount_rate / 100);
    
    v_after_all_discounts := v_after_items_discount - v_global_discount_amount;
    
    -- Global Tax applied on (After All Discounts)
    v_global_tax_amount := v_after_all_discounts * (v_global_tax_rate / 100);
    
    -- 4. Final Sums
    v_final_discount := v_items_discount + v_global_discount_amount;
    v_final_tax := v_items_tax + v_global_tax_amount;
    v_final_total := v_after_all_discounts + v_final_tax;

    -- 5. Update Invoice
    UPDATE invoices SET
        total_ht = v_subtotal_ht,
        total_discount = v_final_discount,
        total_tax = v_final_tax,
        total_ttc = v_final_total,
        updated_at = NOW()
    WHERE id = p_invoice_id;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Add item to invoice (Updated with calculation)
CREATE OR REPLACE FUNCTION add_invoice_item(
    p_invoice_id UUID,
    p_description TEXT,
    p_quantity DECIMAL,
    p_unit_price DECIMAL,
    p_tax DECIMAL DEFAULT 0,
    p_discount DECIMAL DEFAULT 0
)
RETURNS JSON AS $$
DECLARE
    new_position INTEGER;
    new_item_id UUID;
    result JSON;
BEGIN
    SELECT COALESCE(MAX(position), 0) + 1 INTO new_position
    FROM invoice_items WHERE invoice_id = p_invoice_id;
    
    INSERT INTO invoice_items (invoice_id, description, quantity, unit_price, tax_rate, discount_rate, position)
    VALUES (p_invoice_id, p_description, p_quantity, p_unit_price, p_tax, p_discount, new_position)
    RETURNING id INTO new_item_id;
    
    -- Recalculate Totals
    PERFORM perform_invoice_calculation(p_invoice_id);
    
    -- Return the created item
    SELECT json_build_object(
        'id', id,
        'description', description,
        'quantity', quantity,
        'unitPrice', unit_price,
        'tax', tax_rate,
        'discount', discount_rate
    ) INTO result FROM invoice_items WHERE id = new_item_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Update invoice (Updated with calculation)
CREATE OR REPLACE FUNCTION update_invoice(
    p_invoice_id UUID,
    p_client_info JSONB DEFAULT NULL,
    p_global_tax DECIMAL DEFAULT NULL,
    p_global_discount DECIMAL DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    UPDATE invoices SET
        client_info = COALESCE(p_client_info, client_info),
        global_tax_rate = COALESCE(p_global_tax, global_tax_rate),
        global_discount_rate = COALESCE(p_global_discount, global_discount_rate),
        updated_at = CURRENT_TIMESTAMP
    WHERE id = p_invoice_id;
    
    -- Recalculate Totals (in case global rates changed)
    PERFORM perform_invoice_calculation(p_invoice_id);
    
    -- Return fresh data
    SELECT get_invoice_with_items(p_invoice_id) INTO result;
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Update invoice item (New)
CREATE OR REPLACE FUNCTION update_invoice_item(
    p_item_id UUID,
    p_description TEXT DEFAULT NULL,
    p_quantity DECIMAL DEFAULT NULL,
    p_unit_price DECIMAL DEFAULT NULL,
    p_tax DECIMAL DEFAULT NULL,
    p_discount DECIMAL DEFAULT NULL
)
RETURNS JSON AS $$
DECLARE
    v_invoice_id UUID;
    result JSON;
BEGIN
    SELECT invoice_id INTO v_invoice_id FROM invoice_items WHERE id = p_item_id;
    
    UPDATE invoice_items SET
        description = COALESCE(p_description, description),
        quantity = COALESCE(p_quantity, quantity),
        unit_price = COALESCE(p_unit_price, unit_price),
        tax_rate = COALESCE(p_tax, tax_rate),
        discount_rate = COALESCE(p_discount, discount_rate)
    WHERE id = p_item_id;
    
    -- Recalculate Totals
    PERFORM perform_invoice_calculation(v_invoice_id);
    
    -- Return the updated item
    SELECT json_build_object(
        'id', id,
        'description', description,
        'quantity', quantity,
        'unitPrice', unit_price,
        'tax', tax_rate,
        'discount', discount_rate
    ) INTO result FROM invoice_items WHERE id = p_item_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Delete invoice item (Updated with calculation)
CREATE OR REPLACE FUNCTION delete_invoice_item(p_item_id UUID)
RETURNS BOOLEAN AS $$
DECLARE
    v_invoice_id UUID;
BEGIN
    SELECT invoice_id INTO v_invoice_id FROM invoice_items WHERE id = p_item_id;
    
    DELETE FROM invoice_items WHERE id = p_item_id;
    
    IF FOUND THEN
        PERFORM perform_invoice_calculation(v_invoice_id);
        RETURN TRUE;
    END IF;
    
    RETURN FALSE;
END;
$$ LANGUAGE plpgsql;

-- Procedure: Get invoice with items (UPDATED TO RETURN TOTALS)
CREATE OR REPLACE FUNCTION get_invoice_with_items(p_invoice_id UUID)
RETURNS JSON AS $$
DECLARE
    result JSON;
BEGIN
    SELECT json_build_object(
        'id', d.id,
        'reference', d.reference,
        'clientInfo', d.client_info,
        'globalTax', d.global_tax_rate,
        'globalDiscount', d.global_discount_rate,
        'totals', json_build_object(
            'subtotal', d.total_ht,
            'discountTotal', d.total_discount,
            'taxTotal', d.total_tax,
            'total', d.total_ttc
        ),
        'status', d.status,
        'createdAt', d.created_at,
        'updatedAt', d.updated_at,
        'items', COALESCE((
            SELECT json_agg(json_build_object(
                'id', i.id,
                'description', i.description,
                'quantity', i.quantity,
                'unitPrice', i.unit_price,
                'tax', i.tax_rate,
                'discount', i.discount_rate
            ) ORDER BY i.position, i.created_at)
            FROM invoice_items i WHERE i.invoice_id = d.id
        ), '[]'::json)
    ) INTO result
    FROM invoices d
    WHERE d.id = p_invoice_id;
    
    RETURN result;
END;
$$ LANGUAGE plpgsql;


-- Procedure: List invoices
CREATE OR REPLACE FUNCTION list_invoices(
    p_limit INTEGER DEFAULT 50,
    p_offset INTEGER DEFAULT 0
)
RETURNS TABLE(
    id UUID,
    reference VARCHAR,
    client_name TEXT, -- Extracted from JSONB
    item_count BIGINT,
    total_ttc DECIMAL,
    status VARCHAR,
    created_at TIMESTAMP
) AS $$
BEGIN
    RETURN QUERY
    SELECT 
        d.id,
        d.reference,
        d.client_info->>'name' as client_name,
        COUNT(i.id) as item_count,
        d.total_ttc, -- This field needs to be maintained or calculated. For strict realtime, we can calc it.
                     -- For now let's just return 0 or do a subquery sum if total_ttc isn't auto-maintained.
                     -- Let's stick to simple select for MVP.
        d.status,
        d.created_at
    FROM invoices d
    LEFT JOIN invoice_items i ON i.invoice_id = d.id
    GROUP BY d.id
    ORDER BY d.updated_at DESC
    LIMIT p_limit OFFSET p_offset;
END;
$$ LANGUAGE plpgsql;
