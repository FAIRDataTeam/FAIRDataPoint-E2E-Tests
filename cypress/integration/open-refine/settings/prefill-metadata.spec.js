describe.skip('OpenRefine-ext: Settings - prefill metadata', () => {
    const projectName = 'Cypress settings test'
    const dialogTitle = 'Create metadata in FAIR Data Point'

    before(() => {
        cy.refineCleanProjects()
        cy.refineCreateProject(projectName)
    })

    beforeEach(() => {
        cy.refineOpenProject(projectName)
        cy.refineClearConfig()
        cy.refineReloadConfig()
    })

    it('can does not have to fill any metadata', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings1.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        // Get select field
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Albert Einstein) @ http://localhost')
        cy.refineGetBind('connectButton').click()
        // Open catalog dialog
        cy.refineGetBind('catalogAddButton').click()
        cy.refineGetBind('optionalShowButton').click()
        // Check if all fields are empty
        cy.refineGetBind('metadataForm').find('input').should('be.empty')
    })

    it('can prefill metadata for all connections (I. - present)', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings3.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Albert Einstein) @ http://localhost')
        cy.refineGetBind('connectButton').click()
        // Open catalog dialog
        cy.refineGetBind('catalogAddButton').click()
        cy.refineGetBind('optionalShowButton').click()
        // Check prefilled
        cy.refineGetBind('metadataForm').find('#publisher').should('have.value', 'http://publisher')
        cy.refineGetBind('metadataForm').find('#language').should('have.value', 'http://id.loc.gov/vocabulary/iso639-1/en')
        cy.refineGetBind('metadataForm').find('#license').should('have.value', 'http://purl.org/NET/rdflicense/cc-by3.0')
    })

    it('can prefill metadata for all connections (II. - present)', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings3.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Nikola Tesla) @ http://localhost')
        cy.refineGetBind('connectButton').click()
        // Open catalog dialog
        cy.refineGetBind('catalogAddButton').click()
        cy.refineGetBind('optionalShowButton').click()
        // Check prefilled
        cy.refineGetBind('metadataForm').find('#publisher').should('have.value', 'http://publisher')
        cy.refineGetBind('metadataForm').find('#language').should('have.value', 'http://id.loc.gov/vocabulary/iso639-1/en')
        cy.refineGetBind('metadataForm').find('#license').should('have.value', 'http://purl.org/NET/rdflicense/cc-by3.0')
    })

    it('can prefill metadata for all connections (III. - present, custom)', () => {
        const fdpUri = Cypress.env('api_url')
        const email = Cypress.env('admin_username')
        const password = Cypress.env('admin_password')
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings3.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        cy.refineGetBind('fdpConnectionSelect').select('Custom FDP connection')
        cy.refineMetadataConnect(fdpUri, email, password)
        // Open catalog dialog
        cy.refineGetBind('catalogAddButton').click()
        cy.refineGetBind('optionalShowButton').click()
        // Check prefilled
        cy.refineGetBind('metadataForm').find('#publisher').should('have.value', 'http://publisher')
        cy.refineGetBind('metadataForm').find('#language').should('have.value', 'http://id.loc.gov/vocabulary/iso639-1/en')
        cy.refineGetBind('metadataForm').find('#license').should('have.value', 'http://purl.org/NET/rdflicense/cc-by3.0')
    })

    it('can prefill metadata for specific connection (I. - present)', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings4.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Albert Einstein) @ http://localhost')
        cy.refineGetBind('connectButton').click()
        // Open catalog dialog
        cy.refineGetBind('catalogAddButton').click()
        cy.refineGetBind('optionalShowButton').click()
        // Check prefilled
        cy.refineGetBind('metadataForm').find('#publisher').should('have.value', 'http://publisher')
        cy.refineGetBind('metadataForm').find('#language').should('have.value', 'http://id.loc.gov/vocabulary/iso639-1/en')
        cy.refineGetBind('metadataForm').find('#license').should('have.value', 'http://purl.org/NET/rdflicense/cc-by3.0')
    })

    it('can prefill metadata for specific connection (II. - not present)', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings4.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        // Get select field
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Nikola Tesla) @ http://localhost')
        cy.refineGetBind('connectButton').click()
        // Open catalog dialog
        cy.refineGetBind('catalogAddButton').click()
        cy.refineGetBind('optionalShowButton').click()
        // Check if all fields are empty
        cy.refineGetBind('metadataForm').find('input').should('be.empty')
    })

    it('can override prefilled metadata for specific connection (I. - overriden)', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings5.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Albert Einstein) @ http://localhost')
        cy.refineGetBind('connectButton').click()
        // Open catalog dialog
        cy.refineGetBind('catalogAddButton').click()
        cy.refineGetBind('optionalShowButton').click()
        // Check prefilled
        cy.refineGetBind('metadataForm').find('#publisher').should('have.value', 'http://publisher2')
        cy.refineGetBind('metadataForm').find('#language').should('have.value', 'http://id.loc.gov/vocabulary/iso639-1/cs')
        cy.refineGetBind('metadataForm').find('#license').should('have.value', 'http://purl.org/NET/rdflicense/cc-by3.0')
    })

    it('can override prefilled metadata for specific connection (II. - not overriden)', () => {
        // Change settings.yaml configuration file
        cy.refineUseSettingsConfig('openrefine-cfg/settings5.yaml')
        cy.refineReloadConfig()
        // Open metadata dialog
        cy.refineMetadataOpen(dialogTitle)
        // Get select field
        cy.refineGetBind('fdpConnectionSelect').select('My local FDP #01 (Nikola Tesla) @ http://localhost')
        cy.refineGetBind('connectButton').click()
        // Open catalog dialog
        cy.refineGetBind('catalogAddButton').click()
        cy.refineGetBind('optionalShowButton').click()
        // Check prefilled
        cy.refineGetBind('metadataForm').find('#language').should('have.value', 'http://id.loc.gov/vocabulary/iso639-1/en')
        cy.refineGetBind('metadataForm').find('#license').should('have.value', 'http://purl.org/NET/rdflicense/cc-by3.0')
    })
})
